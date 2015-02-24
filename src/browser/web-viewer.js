/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const Component = require('omniscient');
  const {Deck} = require('./deck');
  const {open} = require('./web-viewer/actions');
  const {isActive, isSelected} = require('./deck/actions');
  const {getHardcodedColors} = require('./theme');
  const {IFrame} = require('./iframe');
  const {DOM} = require('react');

  const WebViewer = Component('WebViewer', ({item: webViewerCursor, onOpen, onClose}) => {

    // Do not render anything unless viewer has any `uri`
    if (!webViewerCursor.get('uri')) return null;
    return IFrame({
      className: 'frame flex-1 webviewer' +
                  (webViewerCursor.get('contentOverflows') ? ' contentoverflows' : ''),
      key: webViewerCursor.get('id'),
      isBrowser: true,
      isRemote: true,
      allowFullScreen: true,

      isVisible: isActive(webViewerCursor) || isSelected(webViewerCursor),
      hidden: !isActive(webViewerCursor),
      zoom: webViewerCursor.get('zoom'),
      isFocused: webViewerCursor.get('isFocused'),
      src: webViewerCursor.get('uri'),
      readyState: webViewerCursor.get('readyState'),

      onCanGoBackChange: WebViewer.onCanGoBackChange(webViewerCursor),
      onCanGoForwardChange: WebViewer.onCanGoForwardChange(webViewerCursor),
      onBlur: WebViewer.onBlur(webViewerCursor),
      onFocus: WebViewer.onFocus(webViewerCursor),
      // onAsyncScroll: WebViewer.onUnhandled,
      onClose: event => onClose(webViewerCursor),
      onOpenWindow: event => onOpen(open({uri: event.detail.url})),
      onContextMenu: WebViewer.onUnhandled,
      onError: event => console.error(event),
      onLoadStart: WebViewer.onLoadStart(webViewerCursor),
      onLoadEnd: WebViewer.onLoadEnd(webViewerCursor),
      onMetaChange: WebViewer.onMetaChange(webViewerCursor),
      onIconChange: WebViewer.onIconChange(webViewerCursor),
      onLocationChange: WebViewer.onLocationChange(webViewerCursor),
      onSecurityChange: WebViewer.onSecurityChange(webViewerCursor),
      onTitleChange: WebViewer.onTitleChange(webViewerCursor),
      onPrompt: WebViewer.onPrompt(webViewerCursor),
      onAuthentificate: WebViewer.onAuthentificate(webViewerCursor),
      onScrollAreaChange: WebViewer.onScrollAreaChange(webViewerCursor)
    })
  });

  WebViewer.onUnhandled = event => console.log(event)
  WebViewer.onBlur = webViewerCursor => event =>
    webViewerCursor.set('isFocused', false);

  WebViewer.onFocus = webViewerCursor => event =>
    webViewerCursor.set('isFocused', true);

  WebViewer.onLoadStart = webViewerCursor => event => webViewerCursor.merge({
    readyState: 'loading',
    isLoading: true,
    icons: {},
    title: null,
    location: null,
    securityState: 'insecure',
    securityExtendedValidation: false,
    canGoBack: false,
    canGoForward: false
  });

  WebViewer.onLoadEnd = webViewerCursor => event => webViewerCursor.merge({
    readyState: 'loaded',
    isLoading: false
  });

  WebViewer.onTitleChange = webViewerCursor => event =>
    webViewerCursor.set('title', event.detail);

  WebViewer.onLocationChange = webViewerCursor => event =>
    webViewerCursor.merge(Object.assign({location: event.detail},
                                        getHardcodedColors(event.detail)));

  WebViewer.onIconChange = webViewerCursor => event =>
    webViewerCursor.setIn(['icons', event.detail.href], event.detail);

  WebViewer.onMetaChange = webViewerCursor => event =>
    webViewerCursor.set('metadata', event.detail);

  WebViewer.onCanGoBackChange = webViewerCursor => event =>
    webViewerCursor.set('canGoBack', event.detail);

  WebViewer.onCanGoForwardChange = webViewerCursor => event =>
    webViewerCursor.set('canGoForward', event.detail);

  WebViewer.onPrompt = webViewerCursor => event => console.log(event);

  WebViewer.onAuthentificate = webViewerCursor => event => console.log(event);

  WebViewer.onScrollAreaChange = webViewerCursor => event =>
    webViewerCursor.set('contentOverflows',
              event.detail.height > event.target.parentNode.clientHeight);

  WebViewer.onSecurityChange = webViewerCursor => event =>
    webViewerCursor.merge({securityState: event.detail.state,
                           securityExtendedValidation: event.detail.extendedValidation});

  WebViewer.Deck = Deck(WebViewer);
  // Exports:

  exports.WebViewer = WebViewer;

});