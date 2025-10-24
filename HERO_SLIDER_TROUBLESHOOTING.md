# Hero Slider Troubleshooting Guide

## Issue: Slider images not showing on homepage

### Problem
You've added images to the Hero Background Slider in the admin panel, but the images are not appearing on the homepage. Instead, you see the default Unsplash image.

### Why This Happens
The hero slider needs to load slides from Firebase Firestore. If the slider is not showing your images, it could be due to:

1. **Slider is disabled** - Check if the "Enable Background Slider" checkbox is checked
2. **No slides uploaded** - Images need to be saved to Firebase
3. **Browser cache** - Old images might be cached
4. **Settings not saved** - Slider settings need to be saved

### Step-by-Step Fix

#### 1. Check Slider Settings
- Go to admin panel: `/admin.html`
- Navigate to "Hero Background Slider" section
- Make sure "Enable Background Slider" is **CHECKED**
- Click "Save Settings"

#### 2. Add/Update Slides
- In the "Slider Images" section, you should see your slides
- For each slide:
  - Click "Upload Image" to add an image
  - Fill in the Title (optional)
  - Fill in Alt Text (for accessibility)
  - Click "Update Slide"

#### 3. Verify in Firebase
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project: `atelia-a0e81`
- Go to Firestore Database
- Check these collections:
  - `heroSlides` - Should contain your slide documents
  - `content/sliderSettings` - Should have `enabled: true`

#### 4. Check the Preview
- In the admin panel, the "Slider Preview" should show your images cycling
- If preview works but homepage doesn't, clear your browser cache

#### 5. Clear Browser Cache
- **Chrome/Edge**: Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
- Select "Cached images and files"
- Click "Clear data"
- Refresh the homepage

#### 6. Verify on Homepage
- Go to your homepage: `/` or `index.html`
- Wait 5 seconds to see if images cycle
- Open browser console (F12) to check for errors
- Look for message: "Loaded hero slides: X" where X is the number of slides

### Default Fallback Image
The Unsplash image you mentioned is the **fallback background**. It shows when:
- No slides are loaded yet
- Slider is disabled
- There's an error loading slides

**Location**: `styles.css` line 55
```css
body::before {
    background-image: url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7...');
}
```

This fallback ensures users always see a background, even if the slider fails to load.

### New Feature: Admin Panel Preview
✅ A live preview has been added to the admin panel!

**Features**:
- Shows all your slides cycling automatically
- Updates in real-time when you add/update slides
- Displays slide counter (e.g., "2 / 4")
- Cycles every 3 seconds (faster than homepage for quick preview)

### Testing Checklist
- [ ] "Enable Background Slider" is checked
- [ ] At least one slide has an image uploaded
- [ ] Clicked "Update Slide" after uploading
- [ ] Clicked "Save Settings" for slider settings
- [ ] Preview in admin panel shows slides cycling
- [ ] Cleared browser cache
- [ ] Checked browser console for errors

### Common Issues

#### Slides show in preview but not on homepage
**Solution**: Clear browser cache and hard refresh (Ctrl + F5)

#### Preview says "No slides to preview"
**Solution**: 
1. Click "Add New Slide"
2. Upload an image for the slide
3. Click "Update Slide"

#### Images upload but don't save
**Solution**: Make sure to click "Update Slide" button after uploading

#### Slider shows first image only (doesn't cycle)
**Solution**: 
1. Add at least 2 slides
2. Check that "Enable Background Slider" is checked
3. Refresh the homepage

### Need More Help?
1. Open browser console (F12)
2. Look for error messages
3. Check if you see: "Loaded hero slides: X"
4. If X = 0, no slides are in Firebase
5. If you see errors, they'll indicate what's wrong

### Quick Test
Run this in browser console on homepage:
```javascript
// Check if slider is initialized
console.log(window.heroSlider);

// Check slides loaded
console.log(window.heroSlider.slides);

// Check settings
console.log(window.heroSlider.settings);
```

This will show you exactly what the slider has loaded.

