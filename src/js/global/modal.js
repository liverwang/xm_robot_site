export function createModal(innerContent, type) {
  const maskLayer = document.createElement('div')
  maskLayer.className = 'mask-layer'
  maskLayer.id = 'mask-layer'
  maskLayer.innerHTML = `
    <div id="center-block" class="center-block">
      <div class="clearfix"><img src="images/global/icon_close.png" class="close-icon pull-right" id="close-modal"/></div>
      <dl class="${type === '' ? 'text-center hide_tips' : 'text-center'}">
        <dt>
          ${type === 1 && type !== '' ? `<img src="images/global/img_success.png"/>` : `<img src="images/global/img_fail.png"/>`}
        </dt>
      </dl>
      ${innerContent}
      <p  class="${type === '' ? 'text-center hide_tips' : 'text-center'}">
        <button class="btn ok_btn" id="ok-btn">知道了</button>
      </p>
    </div>
  `
  document.body.appendChild(maskLayer)

  document.getElementById('mask-layer').onclick = function (e) {
    document.body.removeChild(maskLayer)
  }
  document.getElementById('close-modal').onclick = function (e) {
    document.body.removeChild(maskLayer)
  }
  document.getElementById('ok-btn').onclick = function (e) {
    document.body.removeChild(maskLayer)
  }
  document.getElementById('center-block').onclick = function (e) {
    e.stopPropagation()
  }
}
