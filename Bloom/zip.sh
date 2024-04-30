# Utility file to help zipping the module for release
rm -rf ~/Desktop/Bloom.zip
zip -r ~/Desktop/Bloom.zip Bloom/ -x Bloom/data/data.json Bloom/data/playerLogs.json Bloom/config.toml -o