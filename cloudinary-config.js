// Cloudinary Configuration
export const cloudinaryConfig = {
    cloudName: 'dclyw4klj',
    apiKey: '833654195665815',
    // Note: API Secret should NEVER be exposed in client-side code
    // We'll use unsigned upload preset for client-side uploads
    uploadPreset: 'graphiqmedia'
};

// Cloudinary Upload Widget
export function initCloudinaryWidget(buttonId, onUploadSuccess) {
    const widget = cloudinary.createUploadWidget(
        {
            cloudName: cloudinaryConfig.cloudName,
            uploadPreset: cloudinaryConfig.uploadPreset,
            folder: 'atelia',
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFileSize: 5000000, // 5MB
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            maxImageWidth: 2000,
            maxImageHeight: 2000,
            cropping: true,
            croppingAspectRatio: null,
            croppingShowDimensions: true,
            showSkipCropButton: true,
            theme: 'minimal',
            styles: {
                palette: {
                    window: '#FFFFFF',
                    windowBorder: '#3A3A3A',
                    tabIcon: '#3A3A3A',
                    menuIcons: '#3A3A3A',
                    textDark: '#000000',
                    textLight: '#FFFFFF',
                    link: '#3A3A3A',
                    action: '#3A3A3A',
                    inactiveTabIcon: '#999999',
                    error: '#F44235',
                    inProgress: '#3A3A3A',
                    complete: '#4CAF50',
                    sourceBg: '#F5F5F5'
                }
            }
        },
        (error, result) => {
            if (!error && result && result.event === 'success') {
                console.log('Upload successful:', result.info);
                const imageUrl = result.info.secure_url;
                if (onUploadSuccess) {
                    onUploadSuccess(imageUrl);
                }
            } else if (error) {
                console.error('Upload error:', error);
                alert('Upload failed: ' + error.message);
            }
        }
    );

    document.getElementById(buttonId).addEventListener('click', () => {
        widget.open();
    }, false);

    return widget;
}

// Helper function to get optimized image URL
export function getOptimizedImageUrl(url, options = {}) {
    const {
        width = 800,
        height = null,
        crop = 'fill',
        quality = 'auto',
        format = 'auto'
    } = options;

    if (!url || !url.includes('cloudinary.com')) {
        return url; // Return original if not a Cloudinary URL
    }

    // Parse the Cloudinary URL and inject transformations
    const transformations = [
        `w_${width}`,
        height ? `h_${height}` : null,
        `c_${crop}`,
        `q_${quality}`,
        `f_${format}`
    ].filter(Boolean).join(',');

    return url.replace('/upload/', `/upload/${transformations}/`);
}

// Get thumbnail version
export function getThumbnailUrl(url) {
    return getOptimizedImageUrl(url, {
        width: 400,
        height: 300,
        crop: 'fill',
        quality: 'auto'
    });
}

