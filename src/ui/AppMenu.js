export default class AppMenu {
  constructor(menuHandler) {
    this.menuKey = 'appMenu';

    menuHandler.update({
      toggleBtnId: 'toggle-menu-btn',
      menuLmId: 'app-menu',
      closeBtnId: 'app-menu__close-btn',
      menuKey: this.menuKey
    });
  }

  dispose() {
    this.menuHandler.dispose(this.menuKey);
  }
}