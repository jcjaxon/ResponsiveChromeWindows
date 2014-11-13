// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

tabs = {};
tabIds = [];

var arrTabsIDs = new Array();

focusedWindowId = undefined;
currentWindowId = undefined;

$(document).foundation();

function bootStrap() {
    chrome.windows.getCurrent(function (currentWindow) {
        currentWindowId = currentWindow.id;
        chrome.windows.getLastFocused(function (focusedWindow) {
            focusedWindowId = focusedWindow.id;
            loadWindowList();
        });
    });

    document.getElementById('txt_URL').value = localStorage["url"];

    appendToLog(screen.width + ' ' + screen.height)

    document.getElementById('a_Start').onclick = funcStart;

}

function funcStart() {

    arrWindowIDs = new Array();

    var url = document.getElementById('txt_URL').value;

    var arr = new Array();
    // arr.put (...); // a new JSONObject()
    //arr.put (...); // a new JSONObject()


    //json.put ("aoColumnDefs",arr);

    for (var i = 1; i < 3; i++) {

        var json = new Object();


        json = { "width": document.getElementById('txt_width_' + i).value, 
                 "height": document.getElementById('txt_height_' + i).value };

        arr.push(json);

    }

    appendToLog('w:' + arr[0].width);
    appendToLog('h:' + arr[0].height);
    
    var args = {
        'left': 0,
        'top': 0,
        'width': eval(arr[0].width),
        'height': eval(arr[0].height),
        'url': url
    }

    createWindowNew(args);


    appendToLog('w:' + arr[1].width);
    appendToLog('h:' + arr[1].height);

    var args = {
        'left': 1500,
        'top': 0,
        'width': eval(arr[1].width),
        'height': eval(arr[1].height),
        'url': url
    }

    createWindowNew(args);

    saveChanges();

    loadWindowList();

}

function saveChanges() {

    localStorage["url"] = document.getElementById('txt_URL').value;

    // Get a value saved in a form.
    //var theValue = document.getElementById('txt_URL').value;
    //// Check that there's some code there.
    //if (!theValue) {
    //    appendToLog('Error: No value specified');
    //    return;
    //}
    //// Save it using the Chrome extension storage API.
    //chrome.storage.local.set({ 'url': theValue }, function () {
    //    // Notify that we saved.
    //    appendToLog('Settings saved');
    //});
}

function funcRefresh() {

    for (var i = 0; i < arrTabsIDs.length; i++) {

        updateTabNew(arrTabsIDs[i], 'http://www.google.co.uk');

    }

}

function isInt(i) {
    return (typeof i == "number") && !(i % 1) && !isNaN(i);
}

function loadWindowList() {
    chrome.windows.getAll({ populate: true }, function (windowList) {
        tabs = {};
        tabIds = [];
        for (var i = 0; i < windowList.length; i++) {
            windowList[i].current = (windowList[i].id == currentWindowId);
            windowList[i].focused = (windowList[i].id == focusedWindowId);

            for (var j = 0; j < windowList[i].tabs.length; j++) {
                tabIds[tabIds.length] = windowList[i].tabs[j].id;
                tabs[windowList[i].tabs[j].id] = windowList[i].tabs[j];
            }
        }

        var input = new JsExprContext(windowList);
        var output = document.getElementById('windowList');
        jstProcess(input, output);
    });
}

function updateTabData(id) {
    var retval = {
        url: document.getElementById('url_' + id).value,
        selected: document.getElementById('selected_' + id).value ? true : false
    }

    return retval;
}

function updateTab(id) {
    try {
        chrome.tabs.update(id, updateTabData(id));
    } catch (e) {
        alert(e);
    }
}

function updateTabNew(id, _url) {

    if (_url == undefined) {

        chrome.tabs.get(arrTabsIDs[0], function (tab) {
            //var input = new JsExprContext(tab);
            //var output = document.getElementById('tab_' + tab.id);
            //jstProcess(input, output);
            //appendToLog('tab refreshed -- tabId: ' + tab.id + ' url: ' + tab.url);
            updateTabNew(arrTabsIDs[1], tab.url);

        });

        return;

    }

    try {
        chrome.tabs.update(id, { url: _url });
    } catch (e) {
        alert(e);
    }
}
function moveTabData(id) {
    return {
        'index': parseInt(document.getElementById('index_' + id).value),
        'windowId': parseInt(document.getElementById('windowId_' + id).value)
    }
}

function moveTab(id) {
    try {
        chrome.tabs.move(id, moveTabData(id));
    } catch (e) {
        alert(e);
    }
}

function createTabData(id) {
    return {
        'index': parseInt(document.getElementById('index_' + id).value),
        'windowId': parseInt(document.getElementById('windowId_' + id).value),
        'index': parseInt(document.getElementById('index_' + id).value),
        'url': document.getElementById('url_' + id).value,
        'selected': document.getElementById('selected_' + id).value ? true : false
    }
}

function createTab() {
    var args = createTabData('new')

    if (!isInt(args.windowId))
        delete args.windowId;
    if (!isInt(args.index))
        delete args.index;

    try {
        chrome.tabs.create(args);
    } catch (e) {
        alert(e);
    }
}

function updateAll() {
    try {
        for (var i = 0; i < tabIds.length; i++) {
            chrome.tabs.update(tabIds[i], updateTabData(tabIds[i]));
        }
    } catch (e) {
        alert(e);
    }
}

function moveAll() {
    appendToLog('moving all');
    try {
        for (var i = 0; i < tabIds.length; i++) {
            chrome.tabs.move(tabIds[i], moveTabData(tabIds[i]));
        }
    } catch (e) {
        alert(e);
    }
}

function removeTab(tabId) {
    try {
        chrome.tabs.remove(tabId, function () {
            appendToLog('tab: ' + tabId + ' removed.');
        });
    } catch (e) {
        alert(e);
    }
}

function appendToLog(logLine) {
    document.getElementById('log')
        .appendChild(document.createElement('div'))
        .innerText = "> " + logLine;
}

function clearLog() {
    document.getElementById('log').innerText = '';
}

chrome.windows.onCreated.addListener(function (createInfo) {
    appendToLog('windows.onCreated -- window: ' + createInfo.id);

    loadWindowList();
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
    focusedWindowId = windowId;
    appendToLog('windows.onFocusChanged -- window: ' + windowId);
    loadWindowList();
});

chrome.windows.onRemoved.addListener(function (windowId) {
    appendToLog('windows.onRemoved -- window: ' + windowId);
    loadWindowList();
});

chrome.tabs.onCreated.addListener(function (tab) {
    appendToLog(
        'tabs.onCreated -- window: ' + tab.windowId + ' tab: ' + tab.id +
        ' title: ' + tab.title + ' index ' + tab.index + ' url ' + tab.url);

    arrTabsIDs.push(tab.id);

    loadWindowList();
});

chrome.tabs.onAttached.addListener(function (tabId, props) {
    appendToLog(
        'tabs.onAttached -- window: ' + props.newWindowId + ' tab: ' + tabId +
        ' index ' + props.newPosition);
    loadWindowList();
});

chrome.tabs.onMoved.addListener(function (tabId, props) {
    appendToLog(
        'tabs.onMoved -- window: ' + props.windowId + ' tab: ' + tabId +
        ' from ' + props.fromIndex + ' to ' + props.toIndex);
    loadWindowList();
});

function refreshTab(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        var input = new JsExprContext(tab);
        var output = document.getElementById('tab_' + tab.id);
        jstProcess(input, output);
        appendToLog('tab refreshed -- tabId: ' + tab.id + ' url: ' + tab.url);
    });
}

chrome.tabs.onUpdated.addListener(function (tabId, props) {

    appendToLog(
        'tabs.onUpdated -- tab: ' + tabId + ' status "' + props.status +
        '" url ' + props.url + ' ' + arrTabsIDs[0]);

    var status = '' + props.status;

    if (tabId === arrTabsIDs[0]) {

        if (props.status == 'loading') {

            appendToLog('UPDATING TAB');

            updateTabNew(arrTabsIDs[1], props.url);

        }

    }

    refreshTab(tabId);

});

chrome.tabs.onDetached.addListener(function (tabId, props) {
    appendToLog(
        'tabs.onDetached -- window: ' + props.oldWindowId + ' tab: ' + tabId +
        ' index ' + props.oldPosition);
    loadWindowList();
});

chrome.tabs.onSelectionChanged.addListener(function (tabId, props) {
    appendToLog(
        'tabs.onSelectionChanged -- window: ' + props.windowId + ' tab: ' +
        tabId);
    loadWindowList();
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    appendToLog('tabs.onRemoved -- tab: ' + tabId);
    loadWindowList();
});

function createWindow() {
    var args = {
        'left': parseInt(document.getElementById('new_window_left').value),
        'top': parseInt(document.getElementById('new_window_top').value),
        'width': parseInt(document.getElementById('new_window_width').value),
        'height': parseInt(document.getElementById('new_window_height').value),
        'url': document.getElementById('new_window_url').value
    }

    if (!isInt(args.left))
        delete args.left;
    if (!isInt(args.top))
        delete args.top;
    if (!isInt(args.width))
        delete args.width;
    if (!isInt(args.height))
        delete args.height;
    if (!args.url)
        delete args.url;

    try {
        chrome.windows.create(args);
    } catch (e) {
        alert(e);
    }
}

function createWindowNew(args) {

    if (!isInt(args.left))
        delete args.left;
    if (!isInt(args.top))
        delete args.top;
    if (!isInt(args.width))
        delete args.width;
    if (!isInt(args.height))
        delete args.height;
    if (!args.url)
        delete args.url;

    try {
        chrome.windows.create(args);
    } catch (e) {
        alert(e);
    }
}

function refreshWindow(windowId) {
    chrome.windows.get(windowId, function (window) {
        chrome.tabs.getAllInWindow(window.id, function (tabList) {
            window.tabs = tabList;
            var input = new JsExprContext(window);
            var output = document.getElementById('window_' + window.id);
            jstProcess(input, output);
            appendToLog(
                'window refreshed -- windowId: ' + window.id + ' tab count:' +
                window.tabs.length);
        });
    });
}

function updateWindowData(id) {
    var retval = {
        left: parseInt(document.getElementById('left_' + id).value),
        top: parseInt(document.getElementById('top_' + id).value),
        width: parseInt(document.getElementById('width_' + id).value),
        height: parseInt(document.getElementById('height_' + id).value)
    }
    if (!isInt(retval.left))
        delete retval.left;
    if (!isInt(retval.top))
        delete retval.top;
    if (!isInt(retval.width))
        delete retval.width;
    if (!isInt(retval.height))
        delete retval.height;

    return retval;
}

function updateWindow(id) {
    try {
        chrome.windows.update(id, updateWindowData(id));
    } catch (e) {
        alert(e);
    }
}

function removeWindow(windowId) {
    try {
        chrome.windows.remove(windowId, function () {
            appendToLog('window: ' + windowId + ' removed.');
        });
    } catch (e) {
        alert(e);
    }
}

function refreshSelectedTab(windowId) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var input = new JsExprContext(tabs[0]);
        var output = document.getElementById('tab_' + tabs[0].id);
        jstProcess(input, output);
        appendToLog(
            'selected tab refreshed -- tabId: ' + tabs[0].id +
            ' url:' + tabs[0].url);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    bootStrap();
});