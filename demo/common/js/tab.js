/* eslint-disable */
var items = [];
var contents = document.querySelector(".contents");
var innerHeight = window.innerHeight || document.body.clientHeight;
var offset = 0;
var onScroll = function(e) {
	var scrollPos = getScrollTop() - offset;
	if (scrollPos === null) {
		return;
	}
	var endScrollPos = scrollPos + innerHeight;
	var visibleItems = items.filter(function (item) {
		return item.start <= endScrollPos && scrollPos <= item.end;
	}).map(function (item) {
		return item.el;
	});

	$(visibleItems).addClass("appear");
};
window.addEventListener("scroll", onScroll);
window.addEventListener("resize", function () {
	refreshOffset();
	innerHeight = window.innerHeight || document.body.clientHeight;
	openTab(Tab.currentTab);
});
function getScrollTop() {
	return window.pageYOffset || document.documentElement.scrollTop | document.body.scrollTop;
}
function refreshOffset() {
	offset = contents.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
}

function openTab(tab) {
	var scrollView = $(".tab-" + tab + ".scroll-view, .tab-" + tab + " .scroll-view");
	var scrollPos = getScrollTop();
	items = scrollView.map(function (index, el) {
		var rect = el.getBoundingClientRect();
		var start = rect.top + scrollPos - offset;
		var end = start + rect.height;

		return {
			el: el,
			start: start,
			end: end,
		};
	}).toArray();

	onScroll();
}
function closeTab(tab) {
	var scrollView = $(".tab-" + tab + ".scroll-view, .tab-" + tab + " .scroll-view");

	scrollView.removeClass("appear");
}

var Tab = {};

Tab.$tabs = $(".tab");
Tab.currentTab = "";
Tab.opens = {
	"home": function () {
		demoIg.trigger("refresh");
	}
};
Tab.closes = {};
Tab.close = function(name) {
	if (!name) {
		return;
	}
	closeTab(name);
	Tab.closes[name] && Tab.closes[name]();
};
Tab.items = [];
Tab.open = function(name) {
	if (Tab.currentTab === name) {
		return;
	}
	refreshOffset();
	Tab.$tabs.css("display", "none");
	var target = $(".tab-" + name);

	target.css("display", "block");

	var currentTab = Tab.currentTab;
	Tab.currentTab = name;

	Tab.opens[name] && Tab.opens[name]();

	openTab(name);
	if (currentTab) {
		Tab.close(currentTab);
	}

};
refreshOffset();
