import os
from pydub import AudioSegment

TARGET_LEVEL = -20
BASE_DIR = "E:\Downloads\Music\Playlists"
OUT_DIR = "E:\Downloads\Music\\normlized"

# Loop through all files and subdirectories in the base directory
for root, dirs, files in os.walk(BASE_DIR):

    # create output subdirectories if it does not exist
    out_subdir = os.path.join(OUT_DIR, os.path.relpath(root, BASE_DIR))
    if not os.path.exists(out_subdir):
        os.makedirs(out_subdir)

    for file in files:
        # Check if the file is an audio file
        if file.endswith(".mp3") or file.endswith(".wav"):
            print('file: %s' % file)
            # Load the audio file using pydub
            file_path = os.path.join(root, file)
            file_name = os.path.basename(file_path)
            file_ext = file_name.split('.')[-1]
            audio = AudioSegment.from_file(file_path, file_ext)
            gain = TARGET_LEVEL - audio.dBFS
            print(f"changed gain by {gain}")

            # Normalize the audio using the target level
            normalized_audio = audio.apply_gain(gain)

            # Save the normalized audio to a new file
            normalized_file_path = os.path.join(out_subdir, file)
            normalized_audio.export(normalized_file_path, format="mp3")
