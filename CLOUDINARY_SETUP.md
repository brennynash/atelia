# Cloudinary Integration Setup

## Overview
This CMS uses Cloudinary for image storage and delivery, providing:
- ✅ Automatic image optimization
- ✅ CDN delivery for fast loading
- ✅ Image transformations on-the-fly
- ✅ Built-in cropping and editing tools

---

## Step 1: Create Upload Preset in Cloudinary

**IMPORTANT:** You need to create an unsigned upload preset for client-side uploads.

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Login with your account
3. Navigate to: **Settings** (gear icon) → **Upload** tab
4. Scroll down to **Upload presets** section
5. Click **Add upload preset**
6. Configure the preset:
   ```
   Preset name: atelia_uploads
   Signing Mode: Unsigned
   Folder: atelia
   Access mode: Public
   Unique filename: true
   Overwrite: false
   ```
7. **Image transformations** (optional but recommended):
   - Max image width: 2000px
   - Max image height: 2000px
   - Format: Auto
   - Quality: Auto
8. Click **Save**

---

## Step 2: Verify Cloudinary Configuration

Your Cloudinary credentials are already configured in `cloudinary-config.js`:

```javascript
cloudName: 'dclyw4klj'
uploadPreset: 'graphiqmedia'  // This must match the preset you created
```

---

## Step 3: Test Image Upload

1. Start your local server
2. Go to: `http://localhost:8000/admin.html`
3. Login with admin credentials
4. Go to any section with images (Projects, Services, or News)
5. Click **"Upload Image"** button
6. Upload widget should open
7. Select an image from your computer
8. Image should upload to Cloudinary and URL will be auto-filled

---

## Upload Preset Configuration Details

### Unsigned Upload Preset Settings

**Basic Settings:**
```
Preset Name: atelia_uploads
Signing Mode: Unsigned (allows client-side uploads)
Folder: atelia (organizes all uploads)
```

**File & Security:**
```
Access Mode: Public
Unique Filename: true
Discard Original Filename: false
Overwrite: false
Invalidate: true
```

**Image Optimization:**
```
Format: Auto (WebP for modern browsers)
Quality: Auto (intelligent compression)
Max Width: 2000px
Max Height: 2000px
```

---

## Security Notes

### Why Unsigned Upload?

Your CMS uses **unsigned upload preset** because:
- ✅ Client-side uploads (no server needed)
- ✅ Firebase Authentication controls who can access admin panel
- ✅ Only authenticated admins can use upload widget
- ✅ Cloudinary limits uploads by preset configuration

### API Secret Security

⚠️ **IMPORTANT:** The API secret (`3Dwu_GxKuSq4a7eC3iq7_iKR86U`) is **NOT** exposed in client-side code. It should only be used for server-side operations.

The code only uses:
- `cloudName` (public)
- `uploadPreset` (public, but controlled by Cloudinary settings)

---

## Image Optimization

Cloudinary automatically optimizes all uploaded images:

### Automatic Features:
- **Format conversion**: WebP for modern browsers, JPEG/PNG fallbacks
- **Quality optimization**: Intelligent compression
- **Responsive images**: Can generate multiple sizes
- **CDN delivery**: Fast global loading

### Manual Transformations (in code):

```javascript
// Original
https://res.cloudinary.com/dclyw4klj/image/upload/atelia/project1.jpg

// Optimized (800px width, auto quality, auto format)
https://res.cloudinary.com/dclyw4klj/image/upload/w_800,q_auto,f_auto/atelia/project1.jpg

// Thumbnail (400x300, cropped)
https://res.cloudinary.com/dclyw4klj/image/upload/w_400,h_300,c_fill,q_auto/atelia/project1.jpg
```

---

## Folder Structure in Cloudinary

Your uploads will be organized in Cloudinary:

```
/atelia/
  ├── projects/
  ├── services/
  └── news/
```

---

## Usage Limits & Pricing

### Cloudinary Free Tier:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited uploads

### Monitoring Usage:
1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Check **Dashboard** for current usage
3. Set up alerts for approaching limits

---

## Troubleshooting

### Problem: "Upload preset not found"

**Solution:**
1. Verify preset name is exactly: `atelia_uploads`
2. Check that preset is set to **Unsigned** mode
3. Wait a few minutes after creating preset (caching)

### Problem: "Upload widget not opening"

**Solution:**
1. Check browser console for errors
2. Verify Cloudinary script is loaded (check Network tab)
3. Clear browser cache and reload

### Problem: "Invalid credentials"

**Solution:**
1. Verify `cloudName` is: `dclyw4klj`
2. Check that upload preset exists and is unsigned
3. Try creating a new upload preset

### Problem: "File too large"

**Solution:**
1. Check preset max file size setting
2. Default is 5MB per image
3. Increase in preset settings if needed

---

## Advanced: Image Transformations

You can add image transformations in the admin panel or in code:

### Responsive Images:
```javascript
// Small (mobile)
/w_400,q_auto,f_auto/

// Medium (tablet)
/w_800,q_auto,f_auto/

// Large (desktop)
/w_1200,q_auto,f_auto/

// Extra large (HD)
/w_1920,q_auto,f_auto/
```

### Cropping Modes:
- `c_fill` - Crop to exact dimensions
- `c_fit` - Fit within dimensions
- `c_scale` - Scale to dimensions
- `c_thumb` - Thumbnail with face detection

### Effects:
- `e_blur` - Blur effect
- `e_grayscale` - Black & white
- `e_sharpen` - Sharpen image
- `e_auto_brightness` - Auto adjust brightness

---

## Backup & Migration

### Export All Images:
1. Go to Cloudinary Console
2. Navigate to **Media Library**
3. Select folder: `atelia`
4. Click **Download** to export all images

### Migrate to Different Account:
1. Export images from old account
2. Create new upload preset in new account
3. Update `cloudName` in `cloudinary-config.js`
4. Re-upload images

---

## Support

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Upload Widget**: https://cloudinary.com/documentation/upload_widget
- **Support**: https://support.cloudinary.com

---

## Your Cloudinary Details

```
Cloud Name: dclyw4klj
Upload Preset: graphiqmedia
API Key: 833654195665815
API Secret: [Hidden - Server-side only]
```

✅ **Cloudinary is now integrated with your CMS!**
