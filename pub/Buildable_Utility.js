function uuidv4() {
  // Function taken from:
  // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid

  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );

}

function getSizeCSS(element) {
  const computed = getComputedStyle(element);
  const paddingWidth = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
  const paddingHeight = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
  const marginWidth = parseFloat(computed.marginLeft) + parseFloat(computed.marginRight);
  const marginHeight = parseFloat(computed.marginLeft) + parseFloat(computed.marginRight);
  const boxSizing = computed.boxSizing;

  const data = {
    contentWidth:               boxSizing === "border-box" ? element.offsetWidth : element.clientWidth - paddingWidth,
    contentHeight:              boxSizing === "border-box" ? element.offsetHeight : element.clientHeight - paddingHeight,
    width:                      element.clientWidth - paddingWidth,
    height:                     element.clientHeight - paddingHeight,
    widthPadding:               element.clientWidth,
    heightPadding:              element.clientHeight,
    widthPaddingBorder:         element.offsetWidth,
    heightPaddingBorder:        element.offsetHeight,
    widthPaddingBorderMargin:   element.offsetWidth + marginWidth,
    heightPaddingBorderMargin:  element.offsetHeight + marginHeight,
    boxSizing:                  boxSizing,
  }

  return data;
}