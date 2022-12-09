# You can use pydub module to achieve normalization of peak volume with the least amount of code. Install pydub using

# pip install pydub
# By using os.walk you can get file names; And by using endswith you can check file format.

# This code normalizes all audio file in BASE_PATH and saves them in OUTPUT_PATH.

# You have to change BASE_PATH and OUTPUT_PATH and AUDIO_FORMAT_LIST by considering your situation.

from pydub import AudioSegment
import os

BASE_PATH = "your/files/folder/path/"
OUTPUT_PATH = "path/that/you/want/save/new/files/"
AUDIO_FORMAT_LIST = ["mp3", "wav"]  # audio formats you want to change


def match_target_amplitude(sound, target_dBFS):
    change_in_dBFS = target_dBFS - sound.dBFS
    return sound.apply_gain(change_in_dBFS)


filenames = next(
    os.walk(BASE_PATH),
    (None, None, []),
)
for filename in filenames:
    flag = False
    file_audio_format = ""
    for audio_format in AUDIO_FORMAT_LIST:
        if filename.endswith("." + audio_format):
            flag = True
            file_audio_format = audio_format
            break
    if flag:
        sound = AudioSegment.from_file(BASE_PATH + filename, file_audio_format)
        normalized_sound = match_target_amplitude(sound, -14.0)
        normalized_sound.export(
            OUTPUT_PATH + "nomrmalized" + filename, format=file_audio_format
        )