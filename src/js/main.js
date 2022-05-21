import Gallery from 'components/gallery';
import VideoEmbed from 'components/video-embed';

import ModuleList from 'components/module';
import HeaderNavigation from 'components/header-navigation';

function init() {
  HeaderNavigation.initialize();

  Gallery.initialize();
  VideoEmbed.initialize();

  const moduleList = new ModuleList();
}

window.onload = () => { document.body.classList.remove('preload') }

init();
