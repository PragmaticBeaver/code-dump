import os
from pydub import AudioSegment
import logging

# Set the target level for normalization (in dB)
TARGET_LEVEL = -1

# Set the base directory for the audio files
BASE_DIR = "E:\Downloads\Music\Playlists"

# Loop through all files and subdirectories in the base directory
for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        # Check if the file is an audio file
        if file.endswith(".mp3") or file.endswith(".wav"):
            print('file: %s' % file)
            # Load the audio file using pydub
            audio = AudioSegment.from_file(os.path.join(root, file))

            # Normalize the audio using the target level
            normalized_audio = audio.apply_gain(TARGET_LEVEL - audio.dBFS)

            # Save the normalized audio to a new file
            normalized_audio.export(os.path.join(root, "normalized_" + file), format="mp3")


# This script uses the os and pydub modules to normalize audio files within a directory and its subdirectories.
# It sets the target level for normalization to 0 dB, and it looks for MP3 and WAV files in the ./audio directory
# (you can change this to the directory where your audio files are located).
# For each audio file it finds, the script loads the file using pydub, normalizes it using the target level,
# and saves the normalized audio to a new file.

# To use this script, you will need to install the pydub module by running "pip install pydub" in a terminal or command prompt.
# You will also need to replace the ./audio directory with the directory where your audio files are located.
# After you have made these changes, you can run the script by typing python script.py,
# where script.py is the name of the file containing the script.

# This will normalize all audio files within the specified directory and its subdirectories.