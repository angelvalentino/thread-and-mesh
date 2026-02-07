import Utils from "../utils/Utils";

export default class GarmentGallerySlider {
  static imagesCache = {};

  constructor(images, garmentKey) {
    this.utils = new Utils;
    this.garmentKey = garmentKey
    this.images = images;
    this.imageIndex = 0;
    this.eventHandler = {};

    this.root = document.getElementById('garment-gallery');
    this.root.innerHTML = this.generateSlider();

    this.addProgressiveLoading(document.querySelectorAll('.blur-img-loader'));

    this.lms = {
      imageSlider: this.root,
      imageSliderContainer: this.root.querySelector('.garment-gallery__photos-list'),
      imageSliderNav: this.root.querySelector('.garment-gallery__nav'),
      thumbs: [...this.root.querySelectorAll('.garment-gallery__thumb')],
      images: [...this.root.querySelectorAll('.garment-gallery__photo-container')]
    };

    this.eventHandler.updateNavHeight = this.updateNavHeight.bind(this);
    this.eventHandler.handleNavClick = this.handleNavClick.bind(this);
    this.eventHandler.handleNavKeyboardA11y = this.handleNavKeyboardA11y.bind(this);
  
    setTimeout(() => {
      this.updateNavHeight();
      // Ensures the nav is scrolled to the top; Firefox preserves scroll otherwise
      this.lms.imageSliderNav.scrollTop = 0;  
    }, 20);
    
    this.updateSliderNav();

    window.addEventListener('resize', this.eventHandler.updateNavHeight);
    this.lms.imageSliderNav.addEventListener('click', this.eventHandler.handleNavClick);
    this.lms.imageSliderNav.addEventListener('keydown', this.eventHandler.handleNavKeyboardA11y);

    if (this.utils.isTouchBasedDevice()) {
      this.addSwipeEvents();
    }
  }

  getTotalImages() {
    return this.images.length;
  }

  addProgressiveLoading(elements) {
    let isNew = false;

    if (!GarmentGallerySlider.imagesCache[this.garmentKey]) {
      GarmentGallerySlider.imagesCache[this.garmentKey] = [];
    }

    // Check if we preloaded all images
    // We multiply by 2 because we cache both the full-res ("m") and thumbnail ("s") images
    if (GarmentGallerySlider.imagesCache[this.garmentKey].length < this.images.length * 2) {
      isNew = true;
    }

    if (isNew === false) {
      // Preloaded all images no loading management needed
      return;
    }

    elements.forEach(imgContainerLm => {
      // Select the thumbnail image within the container
      const thumbnailImg = imgContainerLm.querySelector('img');

      const loaded = () => {
        imgContainerLm.classList.add('loaded');
        thumbnailImg.ariaBusy = 'false';

        // Delay to smoothly transition from low-res to full-res image
        setTimeout(() => {
          imgContainerLm.style.backgroundImage = 'none';
          imgContainerLm.style.backgroundColor = 'transparent';
        }, 250);

        if (isNew) {
          // Cache the image only if it’s not already in the list
          if (!GarmentGallerySlider.imagesCache[this.garmentKey].some(cachedImg => cachedImg.src === thumbnailImg.src)) {
            // Create a new Image reference to keep the file in memory
            const img = new Image();
            img.src = thumbnailImg.src;
            GarmentGallerySlider.imagesCache[this.garmentKey].push(img);
          } 
        }
      }
      
      // If the image is already fully loaded, run the handler immediately
      if (thumbnailImg.complete) {
        loaded();
      } 
      // Otherwise, add an event listener to handle the image load event
      else {
        // No need to keep a reference to the load event. When slides are switched, 
        // the elements are re-rendered and garbage collected, so the event listener is automatically removed.
        thumbnailImg.addEventListener('load', loaded);
        // Mark the image as loading for accessibility
        thumbnailImg.ariaBusy = 'true';
      }
    });
  }

  addSwipeEvents() {
    const {
      handleTouchStart, 
      handleTouchMove, 
      handleTouchEnd
    } = this.utils.handleSwipe(this.slide.bind(this, 'right'), this.slide.bind(this, 'left'));
      
    this.eventHandler.touchStart = handleTouchStart;
    this.eventHandler.touchMove = handleTouchMove;
    this.eventHandler.touchEnd = handleTouchEnd;

    this.lms.imageSlider.addEventListener('touchstart', this.eventHandler.touchStart, { passive: true });
    this.lms.imageSlider.addEventListener('touchmove', this.eventHandler.touchMove, { passive: true });
    this.lms.imageSlider.addEventListener('touchend', this.eventHandler.touchEnd);
    this.lms.imageSlider.addEventListener('touchcancel', this.eventHandler.touchEnd);
  }

  handleNavKeyboardA11y(e) {
    const thumb = e.target.closest('.garment-gallery__thumb');
    if (!thumb) return;
   
    const currentIndex = Number(thumb.dataset.index);
    let nextIndex = null;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex + 1 < this.lms.thumbs.length ? currentIndex + 1 : 0;
        break;

      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : this.lms.thumbs.length - 1;
        break;

      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        nextIndex = this.lms.thumbs.length - 1;
        break;

      default:
        return;
    }

    this.setSlide(nextIndex);
    this.lms.thumbs[nextIndex].focus();
  }

  handleNavClick(e) {
    const thumbnail = e.target.closest('.garment-gallery__thumb');
    if (thumbnail) {
      const index = Number(thumbnail.dataset.index);
      this.setSlide(index);
    }
  }

  slide(direction) {
    const totalImages = this.getTotalImages();

    if (direction === 'left') {
      // Move left: wrap around to the last image if imageIndex is at the beginning
      this.imageIndex = this.imageIndex === 0 ? totalImages - 1 : --this.imageIndex;
    } 
    else {
      // Move right: wrap around to the first image if imageIndex is at the end
      this.imageIndex = this.imageIndex === totalImages - 1 ? 0 : ++this.imageIndex;
    }

    this.updateSliderNav();
    this.updateSliderImage();
  }


  setSlide(i) {
    if (this.imageIndex === i) {
      return;
    }
    this.imageIndex = i;
    this.updateSliderNav();
    this.updateSliderImage();
  }

  updateSliderImage() {
    this.lms.images.forEach((img, i) => {
      img.style.transform = `translateX(${-100 * this.imageIndex}%)`;
      img.ariaHidden = i !== this.imageIndex;
    });
  }

  updateSliderNav() {
    this.lms.thumbs.forEach(thumb => {
      const isActive = Number(thumb.dataset.index) === this.imageIndex;
      
      thumb.classList.toggle('active', isActive);
      thumb.ariaSelected = isActive;
      thumb.tabIndex = isActive ? 0 : -1;
    });
  }

  updateNavHeight() {
    this.lms.imageSliderNav.style.maxHeight = this.lms.imageSliderContainer.getBoundingClientRect().height + 'px';
  }

  dispose() {
    window.removeEventListener('resize', this.eventHandler.updateNavHeight);
    this.lms.imageSliderNav.removeEventListener('click', this.eventHandler.handleNavClick);
    this.lms.imageSliderNav.removeEventListener('keydown', this.eventHandler.handleNavKeyboardA11y);

    this.lms.imageSlider.removeEventListener('touchstart', this.eventHandler.touchStart);
    this.lms.imageSlider.removeEventListener('touchmove', this.eventHandler.touchMove);
    this.lms.imageSlider.removeEventListener('touchend', this.eventHandler.touchEnd);
    this.lms.imageSlider.removeEventListener('touchcancel', this.eventHandler.touchEnd);
  }

  generateSliderImages() {
    return this.images.map(({ url, alt }, i) => {
      const isCached = GarmentGallerySlider.imagesCache[this.garmentKey]?.some(img => img.src.endsWith(`${url}-m.jpg`));
      const styleAttr = isCached ? '' : `background-image: url(${url}-m-low-res.jpg);`;
      const containerClass = `garment-gallery__photo-container${!isCached ? ' blur-img-loader' : ''}`;

      return `
        <div 
          aria-roledescription="slide"
          aria-hidden="${this.imageIndex !== i}"
          aria-labelledby="garment-gallery__thumb-${i + 1}"
          role="tabpanel" 
          class="${containerClass}"
          id="garment-gallery__photo-container__item-${i + 1}" 
          style="${styleAttr}"
        >
          <img 
            class="garment-gallery__photo" 
            src="${url}-m.jpg" 
            alt="${alt} (image ${i + 1} of ${this.getTotalImages()})"
          >
        </div>
      `
    }).join('');
  }

  generateSliderNav() {
    return this.images.map(({ url, alt }, i) => {
      const isCached = GarmentGallerySlider.imagesCache[this.garmentKey]?.some(img => img.src.endsWith(`${url}-s.jpg`));
      const styleAttr = isCached ? '' : `background-image: url(${url}-s-low-res.jpg);`;
      const containerClass = `garment-gallery__thumb-container${!isCached ? ' blur-img-loader' : ''}`;

      return `
        <li 
          role="presentation" 
          class="${containerClass}"
          style="${styleAttr}"
        >
          <img 
            role="tab"
            aria-selected="${i === this.imageIndex}"
            aria-controls="garment-gallery__photo-container__item-${i + 1}"
            aria-label="Thumbnail of: ${alt} (image ${i + 1} of ${this.getTotalImages()})"
            id="garment-gallery__thumb-${i + 1}"
            class="garment-gallery__thumb" 
            src="${url}-s.jpg" 
            alt=""
            data-index="${i}"
            tabindex="${i === this.imageIndex ? 0 : -1}"
            draggable="false"
          >
        </li>
      `
    }).join('');
  }

  generateSlider() {
    return (
      `
        <div class="garment-gallery__photos-list">
          ${this.generateSliderImages()}
        </div>
        <ul 
          role="tablist" 
          aria-orientation="vertical"
          class="garment-gallery__nav" 
          style="max-height: 100px;
        ">
          ${this.generateSliderNav()}
        </ul>
      `
    );
  }
}