const HIDPI_WIDTH_THRESHOLD = 2800;
const HIDPI_HEIGHT_THRESHOLD = 2800;
const ZOOM_NORMAL = 1;
const ZOOM_HIDPI = 1.5;
const OVERRIDE_CUSTOM_ZOOM = false;

async function updateAll() {
	const screens = await chrome.system.display.getInfo();
	const windows = await chrome.windows.getAll();

	await Promise.all(windows.map(win => updateWin(win, screens)));
}

async function getWinById(winId) {
	if (winId != chrome.windows.WINDOW_ID_NONE && winId != chrome.windows.WINDOW_ID_CURRENT) {
		try {
			return await chrome.windows.get(winId);
		} catch {
			return null;
		}
	} else {
		return null;
	}
}

async function updateWinId(winId) {
	if (winId != chrome.windows.WINDOW_ID_NONE && winId != chrome.windows.WINDOW_ID_CURRENT) {
		const win = await getWinById(winId);
		if (win) {
			await updateWin(win);
		}
	}
}

async function updateWinIdTabId(winId, tabId) {
	if (tabId != chrome.tabs.TAB_ID_NONE) {
		const win = await getWinById(winId);
		if (win) {
			await updateWinTabId(win, tabId);
		}
	}
}

async function updateWin(win, screens) {
	const zoom = await getWinZoom(win, screens);
	if (zoom) {
		await updateWinIdZoom(win.id, zoom);
	}
}

async function updateWinTabId(win, tabId, screens) {
	const zoom = await getWinZoom(win, screens);
	if (zoom) {
		await updateTabIdZoom(tabId, zoom);
	}
}

async function updateWinIdZoom(winId, zoom) {
	const tabs = await chrome.tabs.query({windowId: winId});
	await Promise.all(tabs.map(tab => updateTabIdZoom(tab.id, zoom)));
}

async function updateTabIdZoom(tabId, zoom) {
	try {
		const curZoom = await chrome.tabs.getZoom(tabId);
		if (zoom != curZoom && (curZoom == ZOOM_NORMAL || curZoom == ZOOM_HIDPI || OVERRIDE_CUSTOM_ZOOM)) {
			// This seemingly wrongly sets per-origin zoom first before switching to per-tab zoom.
			// It's deliberate, though: per-tab zoom resets when navigating to another URL, and
			// while we do immediately update it again, it results in an annoying UI popup. By
			// setting the per-origin zoom first, we reduce the number of these popups to an
			// acceptable level.
			await chrome.tabs.setZoom(tabId, zoom);
			await chrome.tabs.setZoomSettings(tabId, {scope: 'per-tab'});
		}
	} catch (e) {
		if (e instanceof Error && e.message.includes("chrome://")) {
			// we can't access chrome:// tabs for security reasons, ignore the exception
		} else if (e instanceof Error && e.message.includes("Cannot zoom a tab in disabled mode")) {
			// cannot zoom unloaded tabs, ignore
		} else if (e instanceof Error && e.message.includes("No tab with id:")) {
			// tab disappeared in the meantime, ignore
		} else {
			throw e;
		}
	}
}

async function getWinZoom(win, screens) {
	const screen = await findScreen(win, screens);
	if (screen && screen.bounds) {
		return screen.bounds.width > HIDPI_WIDTH_THRESHOLD || screen.bounds.height > HIDPI_HEIGHT_THRESHOLD ? ZOOM_HIDPI : ZOOM_NORMAL;
	} else {
		return null;
	}
}

async function findScreen(win, screens) {
	screens ||= await chrome.system.display.getInfo();

	return screens.find(s =>
		win.left >= s.bounds.left &&
		win.left < s.bounds.left + s.bounds.width &&
		win.top >= s.bounds.top &&
		win.top < s.bounds.top + s.bounds.height);
}

function logExceptions(p) {
	p.catch(e => {
		console.dir(e);
		throw e;
	});
}

chrome.runtime.onInstalled.addListener(() => logExceptions(updateAll()));
chrome.runtime.onStartup.addListener(() => logExceptions(updateAll()));
chrome.system.display.onDisplayChanged.addListener(() => logExceptions(updateAll()));
chrome.windows.onBoundsChanged.addListener((win) => logExceptions(updateWinId(win.id)));
chrome.windows.onFocusChanged.addListener((winId) => logExceptions(updateWinId(winId)));
chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => logExceptions(updateWinIdTabId(tab.windowId, tab.id)));
