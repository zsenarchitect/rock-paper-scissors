# Audio System Documentation

## Overview

The Rock Paper Scissors Battle Royale audio system is designed to be **extension-agnostic**, meaning it automatically detects and uses either WAV or MP3 files based on availability. Callers don't need to specify file extensions.

## Key Features

- **Automatic Format Detection**: Tries WAV first, falls back to MP3
- **Extension-Agnostic**: Callers use base names without extensions
- **Error Handling**: Graceful fallback when files are missing
- **Overlap Support**: Multiple sounds can play simultaneously
- **Volume Control**: Master volume and per-sound volume control

## Usage

### Basic Sound Playback

```javascript
// Play a sound by name (no extension needed)
audioManager.playSound('click');
audioManager.playSound('victory');
audioManager.playSound('rockConvert');
```

### Conversion Sounds

```javascript
// Play conversion sound based on entity type
audioManager.playConversionSound('Rock');    // Plays rock-convert.wav or .mp3
audioManager.playConversionSound('Paper');   // Plays paper-convert.wav or .mp3
audioManager.playConversionSound('Scissors'); // Plays scissors-convert.wav or .mp3
```

### UI Sounds

```javascript
// Play UI sounds
audioManager.playClickSound();
audioManager.playVoteSound();
audioManager.playVictorySound();
audioManager.playErrorSound();
```

## File Structure

```
docs/assets/sounds/
├── effects/
│   ├── rock-convert.wav     (or .mp3)
│   ├── paper-convert.wav    (or .mp3)
│   └── scissors-convert.wav (or .mp3)
└── ui/
    ├── click.wav            (or .mp3)
    ├── vote.wav             (or .mp3)
    ├── victory.wav          (or .mp3)
    └── error.wav            (or .mp3)
```

## Configuration

The audio system is configured in `docs/js/config/game-config.js`:

```javascript
audio: {
    enabled: true,
    volume: 0.7,
    overlapSounds: true,
    soundEffects: {
        rockConvert: 'sounds/effects/rock-convert',      // No extension!
        paperConvert: 'sounds/effects/paper-convert',    // No extension!
        scissorsConvert: 'sounds/effects/scissors-convert', // No extension!
        click: 'sounds/ui/click',                        // No extension!
        vote: 'sounds/ui/vote',                          // No extension!
        victory: 'sounds/ui/victory',                    // No extension!
        error: 'sounds/ui/error'                         // No extension!
    }
}
```

## How It Works

### 1. File Detection

When a sound is requested, the system:

1. **Removes any existing extension** from the path
2. **Tries WAV first** (e.g., `sounds/effects/rock-convert.wav`)
3. **Falls back to MP3** if WAV fails (e.g., `sounds/effects/rock-convert.mp3`)
4. **Reports error** if neither format is available

### 2. Loading Process

```javascript
// This is what happens internally:
const basePath = 'sounds/effects/rock-convert';
const wavPath = 'sounds/effects/rock-convert.wav';
const mp3Path = 'sounds/effects/rock-convert.mp3';

// Try WAV first
try {
    loadSound(wavPath);
} catch (error) {
    // Fall back to MP3
    try {
        loadSound(mp3Path);
    } catch (error) {
        // Report error
    }
}
```

### 3. Error Handling

- **Missing Files**: Logs warning, continues without sound
- **Load Failures**: Tries alternative format automatically
- **Playback Errors**: Logs error, doesn't crash the game

## Testing

### Test Page

Open `test-audio.html` in your browser to test the audio system:

```bash
# Start local server
cd docs && python -m http.server 8000

# Open in browser
open http://localhost:8000/../test-audio.html
```

### Test Script

Run the test script to verify configuration:

```bash
python test-audio-manager.js
```

## Adding New Sounds

### 1. Add to Configuration

```javascript
// In docs/js/config/game-config.js
soundEffects: {
    // ... existing sounds ...
    newSound: 'sounds/effects/new-sound'  // No extension!
}
```

### 2. Add Sound Files

Place your sound files in the appropriate directory:

```
docs/assets/sounds/effects/new-sound.wav  (or .mp3)
```

### 3. Use in Code

```javascript
// Play the new sound
audioManager.playSound('newSound');
```

## Best Practices

### File Naming

- Use **kebab-case** for file names: `rock-convert`, `victory-celebration`
- Use **camelCase** for configuration keys: `rockConvert`, `victoryCelebration`
- **No file extensions** in configuration

### File Formats

- **WAV**: Better quality, larger file size
- **MP3**: Smaller file size, good quality
- **Both**: System will automatically choose the best available

### Performance

- **Preload sounds** during initialization
- **Use overlap** for simultaneous sounds
- **Set appropriate volume** levels
- **Handle errors gracefully**

## Troubleshooting

### Common Issues

1. **No sound playing**
   - Check if audio is enabled: `audioManager.getStatus()`
   - Check browser console for errors
   - Verify file paths in configuration

2. **Wrong sound playing**
   - Check file naming matches configuration
   - Verify file format (WAV/MP3)

3. **Performance issues**
   - Reduce number of overlapping sounds
   - Lower volume levels
   - Use smaller file sizes

### Debug Mode

Enable debug logging to see what's happening:

```javascript
// Check audio manager status
console.log(audioManager.getStatus());

// Test individual sounds
audioManager.playSound('click');
audioManager.createDebugSound(440, 0.5); // 440Hz for 0.5 seconds
```

## Migration from Extension-Specific

If you have existing code that specifies file extensions:

### Before (Extension-Specific)
```javascript
audioManager.playSound('click.wav');
audioManager.playSound('victory.mp3');
```

### After (Extension-Agnostic)
```javascript
audioManager.playSound('click');
audioManager.playSound('victory');
```

The system will automatically find the correct file format!
