import * as contentful from "contentful";
import {
    getDynamicProperty, setDynamicProperty,
} from "../../@vaUtil/scriptUtilities.mjs";

/**
 * Create Contentful REST client
 */
let restClient = undefined;
async function createRestClient(usePreview = false) {
    if (restClient) {
        return restClient;
    }

    const config = {
        space: process.env.CONTENTFUL_SPACE,
        accessToken: process.env.CONTENTFUL_API_TOKEN,
        host: usePreview ? "preview.contentful.com" : undefined,
    };
    restClient = contentful.createClient(config);
    return restClient;
}

/**
 * Query Contentful GraphQL API
 */
async function queryGraphQL({
    query,
    variables,
}) {
    const url = process.env.CONTENTFUL_GRAPHQL_ENDPOINT + process.env.CONTENTFUL_SPACE;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.CONTENTFUL_API_TOKEN}`,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const body = await response.json();

        if (body.errors) {
            console.error(body.errors);
        }

        return body;
    } catch (e) {
        console.error(e);
    }
}

/**
 * Load a GraphQL query from the queries directory by importing it as a module using "raw-loader" (configured in next.config.js)
 */
async function loadQuery(filename, fileExtension = ".gql") {
    return await import(`../queries/${filename + fileExtension}`).then((v) => v.default);
}

class ContentfulClient {

    /**
     * Use pagination to query all entries.
     * @param query GraphQL query
     * @param queryVariables variables for the query
     * @param {string} dataKey Object property key of the data object in the response; for example "data.userCollection.items"
     * @param {string} limitProperty Object property key of limit variable; for example "limit" (default "limit")
     * @param {string} skipProperty Object property key of skip variable; for example "skip" (default "skip")
     * @returns {Promise<null|*[]>}
     * @private
     */
    async _queryAllEntries({
        query,
        queryVariables,
        dataKey,
        limitProperty = "limit",
        skipProperty = "skip",
    }) {
        let entries = [];
        let hasMoreEntries = true;
        let contentfulData = undefined;
        while (hasMoreEntries) {
            const response = await queryGraphQL({
                query,
                variables: queryVariables,
            });
            contentfulData = response;

            queryVariables[skipProperty] += queryVariables[limitProperty];
            // const items = dataKey.split(".").reduce((obj, key) => obj[key], response);
            const items = getDynamicProperty(dataKey, response);
            entries = entries.concat(...items);

            const limit = queryVariables[limitProperty];
            if (items?.length < limit) {
                hasMoreEntries = false;
                break;
            }
        }

        // dataKey.split(".").reduce((
        //     obj, key, index, array,
        // ) => {
        //     if (index === array.length - 1) {
        //         obj[key] = entries;
        //     }
        //     return obj[key];
        // }, contentfulData);
        setDynamicProperty(dataKey, entries, contentfulData);
        return entries.length <= 0 ? null : entries;
    }

    async queryChaptersBySubsetId(id) {
        const query = await loadQuery("chapters-bySubsetId");
        const response = await queryGraphQL({
            query,
            variables: {id},
        });
        const exams = response?.data?.subset?.exams?.items;
        if (response?.errors?.length || !exams?.length > 0 || !exams[0].questions?.items?.length > 0) {
            return null;
        }
        const chapters = [];
        response.data.subset.exams.items.forEach((exam) => {
            exam.questions.items.forEach((question) => {
                chapters.push(question.chapter);
            });
        });
        return {
            chapters,
            subsets: [response.data.subset.sys?.id],
        };
    }

    async queryChapterById(id) {
        const query = await loadQuery("chapter-byId");
        const chapter = await this._queryAllEntries({
            query,
            queryVariables: {
                id,
                limit: 10,
                skip: 0,
            },
            dataKey: "data.chapter.questionsCollection.items",
        });
        console.log("contentfulClient.js:135 / queryChapterById", {chapter});
        return chapter;
    }

    async queryCertificateById(id) {
        const query = await loadQuery("certificate-byId");
        const response = await queryGraphQL({
            query,
            variables: {id},
        });
        if (response?.errors?.length || !response?.data?.certificate) {
            return null;
        }
        return response.data.certificate;
    }

    async queryCertificatesByLicenceVariantId(licenceVariantId) {
        const limit = 10;
        let certificateSkip = 0;
        let certificates = [];

        let hasMoreCertificates = true;
        while (hasMoreCertificates) {
            const query = await loadQuery("certificates-byLicenceVariantId");
            const response = await queryGraphQL({
                query,
                variables: {
                    id: licenceVariantId,
                    certificateLimit: limit,
                    certificateSkip: certificateSkip,
                    licenceLimit: limit,
                    licenceSkip: 0,
                },
            });
            let certs = response?.data?.certificates?.items;

            if (certs?.length < limit) {
                console.log("gathered all certificates ...");
                hasMoreCertificates = false;
            }

            const certificatesWithNewLicences = await this._queryAllEntries({
                query,
                queryVariables: {
                    id: licenceVariantId,
                    certificateLimit: limit,
                    certificateSkip: certificateSkip,
                    licenceLimit: limit,
                    licenceSkip: limit, // first X licences were already fetched
                },
                dataKey: "data.certificates.items",
                limitProperty: "licenceLimit",
                skipProperty: "licenceSkip",
            });

            const updatedCertificates = [];
            for (let i = 0; i < certificatesWithNewLicences.length; i++) {
                const currentCert = certificatesWithNewLicences[i];
                const licenceVariants = currentCert?.licenceVariants?.items;
                const knownCert = certs.find((knownCertificate) => knownCertificate.sys.id === currentCert.sys.id);

                if (licenceVariants?.length <= 0) {
                    console.log(`gathered all licences of ${currentCert.sys.id}...`);
                    updatedCertificates.push(knownCert); // add unchanged certificate to results
                    continue;
                }

                if (!knownCert) {
                    console.warn("found new certificate!", {certificate: currentCert});
                    updatedCertificates.push(currentCert); // add newly found certificate to results
                    continue;
                }

                // add new licences to known certificate
                knownCert.licenceVariants.items = knownCert.licenceVariants.items.concat(...currentCert.licenceVariants.items);
                updatedCertificates.push(knownCert);
            }

            certificates = certificates.concat(...updatedCertificates);
            certificateSkip += limit;
        }

        return certificates;
    }

    async queryCertificatesRESTFUL() {
        const client = await createRestClient();
        let data = undefined;
        try {
            data = await client.getEntries({
                skip: 0,
                content_type: "sbfCertificate",
                order: "-fields.sort", // descending order
            });
        } catch (e) {
            const error = JSON.parse(e.message);
            console.error(error);
            if (error?.details?.errors?.length > 0) {
                error.details.errors.forEach((errorDetail) => console.error(errorDetail));
            }
            return null;
        }

        return data?.items || null;
    }

    async queryExamById(id) {
        const query = await loadQuery("exam-byId");
        const response = await queryGraphQL({
            query,
            variables: {id},
        });
        if (response?.errors?.length || !response?.data?.exam) {
            return null;
        }
        const items = response.data.exam.questionsCollection?.items;
        if (!items?.length > 0) {
            // no questions linked to exam
            return response.data.exam;
        }
        return response.data.exam;
    }

    async queryExamIdsByLicenceVariantId(licenceVariantId) {
        const query = await loadQuery("examIds-byLicenceVariantId");
        const response = await queryGraphQL({
            query,
            variables: {id: licenceVariantId},
        });
        const subsets = response.data.licenceVariant?.subsets?.items;
        if (response.errors?.length || !subsets?.length > 0 || !subsets[0]?.exams?.items?.length > 0) {
            return null;
        }
        const ids = [];
        subsets.forEach((subset) => {
            subset.exams.items.forEach((exam) => {
                ids.push(exam.sys?.id);
            });
        });

        return ids?.length > 0 ? ids : null;
    }

    async queryExams() {
        const query = await loadQuery("exams");
        const response = await queryGraphQL({query});
        if (response?.errors?.length || response?.data?.exams?.items?.length < 1) {
            return null;
        }
        return response.data.exams.items;
    }

    async queryExamsById(ids) {
        const query = await loadQuery("exams-byIds");
        const response = await queryGraphQL({
            query,
            variables: {ids},
        });
        if (response?.errors?.length || response?.data?.exams?.items?.length < 1) {
            return null;
        }
        return response.data.exams.items;
    }

    async queryQuestionsByChapterId(chapterId) {
        const query = await loadQuery("questions-byChapterId");
        return await this._queryAllEntries({
            query: query,
            queryVariables: {
                id: chapterId,
                limit: 10,
                skip: 0,
            },
            dataKey: "data.questions.items",
        });
    }

    async queryQuestionsByIdsRESTFUL(ids) {
        const client = await createRestClient();
        let data = undefined;
        try {
            data = await client.getEntries({
                skip: 0,
                content_type:"sbfQuestion",
                order: "-fields.questionName", // descending order
                ["sys.id[in]"]: ids,
            });
        } catch (e) {
            const error = JSON.parse(e.message);
            console.error(error);
            if (error?.details?.errors?.length > 0) {
                error.details.errors.forEach((errorDetail) => console.error(errorDetail));
            }
            return null;
        }
        return data?.items || null;
    }

    async queryQuestionById(id) {
        const query = await loadQuery("question-byId");
        const response = await queryGraphQL({
            query,
            variables: {id},
        });

        if (response?.errors?.length || !response?.data?.question) {
            return null;
        }
        return response.data.question;
    }

    async queryQuestionIdsByExamId(examId) {
        const query = await loadQuery("questionIds-byExamId");
        const response = await queryGraphQL({
            query,
            variables: {id: examId},
        });
        if (response?.errors?.length || response?.data?.exams?.items?.length < 1) {
            return null;
        }

        const ids = [];
        response.data.exams.items.forEach((exam) => {
            exam.questions?.items.forEach((question) => {
                ids.push(question.sys.id);
            });
        });
        return ids;
    }

    async querySubsets() {
        const query = await loadQuery("subsets");
        return await this._queryAllEntries({
            query: query,
            queryVariables: {
                limit: 10,
                skip: 0,
            },
            dataKey: "data.subsets.items",
        });
    }

    async querySubsetsByLicenceVariant(id) {
        const query = await loadQuery("subsets-byLicenceVariant");
        return await this._queryAllEntries({
            query: query,
            queryVariables: {
                id,
                limit: 10,
                skip: 0,
            },
            dataKey: "data.licenceVariant.subsets.items",
        });
    }

    async querySubsetById(id) {
        const query = await loadQuery("subset-byId");
        const response = await queryGraphQL({
            query,
            variables: {id},
        });
        if (response?.errors?.length || !response?.data?.subset) {
            return null;
        }
        return response.data.subset;
    }

    async queryExamIds(questionId) {
        if (!questionId) return null;

        const query = await loadQuery("examIds-byQuestionId");
        const response = await queryGraphQL({
            query,
            variables: {id: questionId},
        });
        if (response?.errors?.length || !response?.data?.ids) {
            return null;
        }
        return response.data.ids.items.map((i) => i.sys.id);
    }

    // async queryLicenceVariantById(id) {
    //     if (!id) return null;
    //
    //     const query = await loadQuery("licenceVariant-byId");
    //     const response = await queryGraphQL({
    //         query,
    //         variables: {id},
    //     });
    //     if (response?.errors?.length || !response?.data?.licenceVariant) {
    //         return null;
    //     }
    //     return response.data.licenceVariant;
    // }
    //
    // async queryLicenceVariantIdsByExamIds(examIds) {
    //     if (!examIds?.length > 0) return null;
    //
    //     const query = await loadQuery("licenceVariantIds-byExamIds");
    //     const response = await queryGraphQL({
    //         query,
    //         variables: {ids: examIds},
    //     });
    //     if (response?.errors?.length || !response?.data?.licenceVariant) {
    //         return null;
    //     }
    //     return response.data.licenceVariant;
    // }
    //
    // async queryLicenceVariantIdBySubsetId(subsetId) {
    //     if (!subsetId) return null;
    //
    //     const query = await loadQuery("licenceVariantIds-bySubsetId");
    //     const response = await queryGraphQL({
    //         query,
    //         variables: {
    //             id: subsetId,
    //             limit: 1,
    //         },
    //     });
    //
    //     if (response?.errors?.length || !response?.data?.sbfLicenceVariantCollection?.items?.length > 0) {
    //         return null;
    //     }
    //     return response.data.sbfLicenceVariantCollection.items[0].sys.id;
    // }

    async queryLicenceVariantsByExamId(examId) {
        if (!examId) return null;

        const query = await loadQuery("licenceVariantId-byExamId");
        const response = await queryGraphQL({
            query,
            variables: {id: examId},
        });

        const subsets = response?.data?.exam?.linkedFrom?.subsets?.items;
        if (response?.errors?.length || !subsets?.length > 0 || !subsets[0]?.linkedFrom?.licenceVariants?.items?.length > 0) {
            return null;
        }
        const licenceVariantIds = [];
        response.data.exam.linkedFrom.subsets.items.forEach((subset) => {
            subset.linkedFrom.licenceVariants.items.forEach((licenceVariant) => {
                licenceVariantIds.push(licenceVariant.sys.id);
            });
        });
        return licenceVariantIds;
    }

    // async queryCertificateIdsByLicenceVariantId(licenceVariantId) {
    //     if (!licenceVariantId) return null;
    //
    //     const query = await loadQuery("certificateIds-byLicenceVariantId");
    //     const response = await queryGraphQL({
    //         query,
    //         variables: {id: licenceVariantId},
    //     });
    //
    //     if (response?.errors?.length || !response?.data?.certificates?.items?.length > 0) {
    //         return null;
    //     }
    //     return response.data.certificates.items.map((i) => i.sys.id);
    // }

}

const client = new ContentfulClient();
export default client;