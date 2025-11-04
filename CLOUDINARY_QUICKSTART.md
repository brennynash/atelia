# ☁️ Cloudinary Quick Start Guide

## 🚀 Setup in 3 Minutes

### Step 1: Create Upload Preset (2 minutes)

1. Go to https://cloudinary.com/console
2. Click **Settings** (⚙️ icon) → **Upload** tab
3. Scroll to **Upload presets** → Click **Add upload preset**
4. Configure:
   - **Preset name**: `atelia_uploads`
   - **Signing Mode**: **Unsigned** ⚠️ (Important!)
   - **Folder**: `atelia`
   - Click **Save**

### Step 2: Test It (1 minute)

1. Start server: `python -m http.server 8000`
2. Open: http://localhost:8000/admin.html
3. Login (see credentials below)
4. Go to Projects section
5. Click **"Upload Image"**
6. Select an image → Done! ✅

---

## 📝 Default Login Credentials

```
Email: admin@ateliabuilt.com
Password: Atelia2024!Admin
```

⚠️ Change password after first login!

---

## ✅ What's Already Configured

- ✅ Cloud Name: `dclyw4klj`
- ✅ API Key: `833654195665815`
- ✅ Upload widget integrated
- ✅ Image optimization enabled
- ✅ CDN delivery ready

---

## 🎯 Upload Preset Settings

**Minimum Required Settings:**
```
Preset name: atelia_uploads
Signing Mode: Unsigned
Folder: atelia
Access mode: Public
```

**Recommended Settings:**
```
Unique filename: true
Overwrite: false
Max image width: 2000px
Max image height: 2000px
Format: Auto
Quality: Auto
```

---

## 🖼️ How Images Work

### Upload Flow:
1. Click "Upload Image" in admin panel
2. Cloudinary widget opens
3. Select image from computer
4. Image uploads to Cloudinary
5. URL automatically filled: `https://res.cloudinary.com/dclyw4klj/image/upload/...`
6. Click "Update" to save
7. Image appears on landing page ✨

### Image URLs:
```
Original:
https://res.cloudinary.com/dclyw4klj/image/upload/atelia/project1.jpg

Optimized (800px, auto quality):
https://res.cloudinary.com/dclyw4klj/image/upload/w_800,q_auto,f_auto/atelia/project1.jpg
```

---

## 📁 Folder Structure

Your uploads are organized in Cloudinary:
```
/atelia/
  └── (all your images)
```

To view your images:
1. Go to https://cloudinary.com/console
2. Click **Media Library**
3. Open folder: `atelia`

---

## 🔧 Troubleshooting

### Problem: "Upload preset not found"
✅ **Solution:** Create the preset with exact name: `atelia_uploads`

### Problem: Widget doesn't open
✅ **Solution:** 
1. Check browser console (F12)
2. Clear cache and reload
3. Verify Cloudinary script loaded

### Problem: Upload fails
✅ **Solution:**
1. Check preset is **Unsigned**
2. Verify cloud name is `dclyw4klj`
3. Check file size (max 5MB by default)

---

## 💡 Quick Tips

### ✨ Image Best Practices:
- Upload high-quality images (Cloudinary will optimize)
- Use JPG for photos, PNG for logos/graphics
- Keep original dimensions ≤ 2000px
- Cloudinary handles all optimization automatically

### 🎨 Supported Formats:
- ✅ JPG/JPEG
- ✅ PNG
- ✅ WebP
- ✅ GIF

### 📊 Free Tier Limits:
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month
- Images: Unlimited uploads

---

## 🎉 You're All Set!

Once you create the upload preset, you can:
- ✅ Upload images directly from admin panel
- ✅ Images auto-optimized for web
- ✅ Fast CDN delivery worldwide
- ✅ No server storage needed

---

## 📚 More Info

- **Full Setup Guide**: See `CLOUDINARY_SETUP.md`
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Upload Widget Docs**: https://cloudinary.com/documentation/upload_widget

---

**Need Help?**
Check `CLOUDINARY_SETUP.md` for detailed troubleshooting and advanced features.
