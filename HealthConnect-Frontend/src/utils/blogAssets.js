export const BLOG_IMAGES = {
  heart: require('../../assets/images/blogs/image_1.png'),
  nutrition: require('../../assets/images/blogs/image_2.png'),
  pediatric: require('../../assets/images/blogs/image_3.png'),
  mental: require('../../assets/images/blogs/image_4.png'),
  posture: require('../../assets/images/blogs/image_5.png'),
  skin: require('../../assets/images/blogs/image_6.png'),
  firstaid: require('../../assets/images/blogs/image_7.png'),
  pregnancy: require('../../assets/images/blogs/image_8.png'),
  stress: require('../../assets/images/blogs/image_9.png'),
  vaccine: require('../../assets/images/blogs/image_10.png'),
  image_1: require('../../assets/images/blogs/image_1.png'),
  image_2: require('../../assets/images/blogs/image_2.png'),
  image_3: require('../../assets/images/blogs/image_3.png'),
  image_4: require('../../assets/images/blogs/image_4.png'),
  image_5: require('../../assets/images/blogs/image_5.png'),
  image_6: require('../../assets/images/blogs/image_6.png'),
  image_7: require('../../assets/images/blogs/image_7.png'),
  image_8: require('../../assets/images/blogs/image_8.png'),
  image_9: require('../../assets/images/blogs/image_9.png'),
  image_10: require('../../assets/images/blogs/image_10.png'),
};

export const getBlogCoverSource = (coverImage) => {
  if (!coverImage) return BLOG_IMAGES.heart;
  if (typeof coverImage === 'number' || (typeof coverImage === 'object' && coverImage.uri)) {
    return coverImage;
  }
  if (typeof coverImage === 'string') {
    if (BLOG_IMAGES[coverImage]) return BLOG_IMAGES[coverImage];
    if (coverImage.includes('image_1.') || coverImage.includes('image_1') || coverImage.includes('8mgeti')) return BLOG_IMAGES.heart;
    if (coverImage.includes('image_2.') || coverImage.includes('image_2') || coverImage.includes('aa79y8')) return BLOG_IMAGES.nutrition;
    if (coverImage.includes('image_3.') || coverImage.includes('image_3') || coverImage.includes('agg0os')) return BLOG_IMAGES.pediatric;
    if (coverImage.includes('image_4.') || coverImage.includes('image_4') || coverImage.includes('c9xfuo')) return BLOG_IMAGES.mental;
    if (coverImage.includes('image_5.') || coverImage.includes('image_5') || coverImage.includes('drjlwm')) return BLOG_IMAGES.posture;
    if (coverImage.includes('image_6.') || coverImage.includes('image_6') || coverImage.includes('hnokd1')) return BLOG_IMAGES.skin;
    if (coverImage.includes('image_7.') || coverImage.includes('image_7') || coverImage.includes('koj442')) return BLOG_IMAGES.firstaid;
    if (coverImage.includes('image_8.') || coverImage.includes('image_8') || coverImage.includes('px5w8n')) return BLOG_IMAGES.pregnancy;
    if (coverImage.includes('image_9.') || coverImage.includes('image_9') || coverImage.includes('qujimz')) return BLOG_IMAGES.stress;
    if (coverImage.includes('image_10.') || coverImage.includes('image_10') || coverImage.includes('xvc1cn')) return BLOG_IMAGES.vaccine;
    if (coverImage.startsWith('http') || coverImage.startsWith('data:')) {
      return { uri: coverImage };
    }
  }
  return BLOG_IMAGES.heart;
};

export default {
  BLOG_IMAGES,
  getBlogCoverSource,
};
