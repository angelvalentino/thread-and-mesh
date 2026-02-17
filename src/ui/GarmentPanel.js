import GarmentGallerySlider from "./GarmentGallerySlider.js";
import GarmentSlider from "./GarmentSlider.js";

export default class GarmentPanel {
  constructor(garmentData, garmentKey, garmentManager, modalHandler, focusOnActiveGarment = true) {
    this.garmentManager = garmentManager;
    this.modalHandler = modalHandler;

    this.eventHandler = {}
    this.garmentKey = null;

    this.garmentData = garmentData;

    this.lms = {
      panel: document.getElementById('garment-panel'),
      garmentTitle: document.getElementById('garment-panel__title'),
      garmentDescription: document.getElementById('garment-panel__description'),
      closeBtn: document.getElementById('garment-panel__close-btn'),
      viewMoreBtn: document.getElementById('garment-panel__view-more-btn')
    }

    this.open(garmentData[garmentKey], garmentKey, focusOnActiveGarment);
  }

  setGarmentKey(garmentKey) {
    this.garmentKey = garmentKey;
  }

  open(garmentData, garmentKey, openFromInitialScene = true) {
    document.body.style.cursor = ''; // makes sure that pointer cursor never lingers from garment hover
    this.eventHandler.closePanel = this.close.bind(this);
    this.eventHandler.enterCloneView = this.garmentManager.enterCloneView.bind(this.garmentManager);

    if (!this.lms.panel.classList.contains('active')) {
      // Show the focusable garment buttons in the accessibility tree if the panel was opened from the action hub
      // So they are available again if we return to the initial scene and need focus
      if (!openFromInitialScene) this.garmentManager.showFocusableBtns();

      this.lms.panel.classList.add('active');

      // If opened from the initial scene, we add and store focus.
      // If opened from the interactive view, we focus but don't restore it
      // to avoid overwriting the last stored key and element.
      this.modalHandler.addFocus({
        modalKey: 'garmentPanel', 
        firstFocusableLm: this.lms.closeBtn,
        auto: openFromInitialScene
      });

      this.updateGarment(garmentData, { 
        newTitleSliderInstance: true, 
        garmentKey: garmentKey, 
        saveHistory: true, 
        focusOnActiveGarment: openFromInitialScene 
      });

      this.lms.viewMoreBtn.addEventListener('click', this.eventHandler.enterCloneView);
      this.modalHandler.addA11yEvents({
        modalKey: 'garmentPanel',
        modalLm: this.lms.panel,
        closeLms: [ this.lms.closeBtn ],
        closeHandler: this.close.bind(this)
      });
    }
  }

  close({ resetPanel = true, deleteActiveGarmentRef = true } = {}) {
    this.dispose({ hidePanel: true });
    this.garmentManager.resetActiveGarment({ resetCamera: resetPanel, deleteActiveGarmentRef });
    
    this.garmentManager.setFocusableBtnsCollapsed(); // reset the focusable buttons expaned status
    
    // If we are not resetting the panel (closing to the action hub), hide the garment focusable buttons from the DOM
    if (!resetPanel) this.garmentManager.hideFocusableBtns();

    if (resetPanel) {
      this.garmentManager.resetActionHubReturnBtn(); // Reset the return button from action hub: set aria-expanded to false and remove it from the DOM
      this.modalHandler.restoreFocus({ modalKey: 'garmentPanel' }); // Restore focus to where it was before the panel and action hub interactions
    }
  }

  updateGarmentInfo({ title, description }) {
    this.lms.garmentTitle.innerText = title;
    this.lms.garmentDescription.innerText = description;
  }

  updateGarment(garmentData, { newTitleSliderInstance, garmentKey, updateSliderPos, saveHistory = false, focusOnActiveGarment = true }) {
    if (garmentKey === this.garmentKey) {
      return;
    }
    
    this.setGarmentKey(garmentKey);
    
    // Update title
    if (newTitleSliderInstance) {
      this.garmentSlider = new GarmentSlider(this.garmentData, garmentKey);
      this.garmentSlider.setGarmentPanelInstance(this);
    } 
    else {
      if (updateSliderPos) {
        this.garmentSlider.updateSliderPos(garmentKey);
        this.garmentSlider.updateTitle();
      } 
      else {
        this.garmentSlider.updateTitle();
      }
    }

    this.garmentSlider.updateSliderControls();
    this.garmentSlider.updateArrowLabels();

    // Re-generate slider
    this.garmentGallerySlider && this.garmentGallerySlider.dispose();
    this.garmentGallerySlider = new GarmentGallerySlider(garmentData.images, garmentKey);
    
    this.updateGarmentInfo(garmentData); // Update additional information
    this.garmentManager.updateActive(garmentKey, saveHistory, focusOnActiveGarment); // Set active garment mesh
  }

  dispose({ hidePanel }) {
    if (this.lms.panel.classList.contains('active')) {
      this.garmentGallerySlider.dispose();
      this.garmentSlider.dispose();
      hidePanel && this.lms.panel.classList.remove('active');

      this.lms.viewMoreBtn.removeEventListener('click', this.eventHandler.enterCloneView);
      this.modalHandler.removeA11yEvents({ modalKey: 'garmentPanel' });
    }
  }
}