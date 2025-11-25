









var leftPaneDragMouseMove = panesMouseMove;
var lpExistingOnMouseMove = document.onmousemove;
if (lpExistingOnMouseMove == null)
	document.onmousemove = leftPaneDragMouseMove;
else
    document.onmousemove = function (event) { leftPaneDragMouseMove(event); lpExistingOnMouseMove(event); };

var leftPaneDragMouseUp = panesMouseUp;
var lpExistingOnMouseUp = document.onmouseup;
if (lpExistingOnMouseUp == null)
    document.onmouseup = leftPaneDragMouseUp;
else
   document.onmouseup = function (event) { leftPaneDragMouseUp(event); lpExistingOnMouseUp(event); };

var currentSelectedItem = null;
function loadrightpane(sUrl, anchor)
{
	sUrl = addParamToURL(sUrl, 'ifrmcntnr', 'T');
	var rightPane = document.getElementById('div__scrollbody');

	rightPane.src = sUrl;
	if(anchor != null)
	{
		setHeaderLoading(anchor.innerHTML);
		makeSelectionVisible(anchor, false);
	}
	else
	{
		setHeaderLoading(null);
	}
}
document.onselectstart = function(evnt)
{
	return _panesOnSelectStart();
};

var innerheadertable = null;
function getInnerHeaderTable()
{
	if(innerheadertable == null)
		innerheadertable = document.getElementById('td_rghtpane_title').firstChild;
	return innerheadertable;
}

function reloadTopLevelPage(sRightPaneUrl, additionalParameter, additionalParameterValue)
{
	var location = new String(document.location);
	if (additionalParameter)
		location = addParamToURL(location, additionalParameter, additionalParameterValue, true);
	document.location = addParamToURL(location, 'startpage', sRightPaneUrl, true);
}

function setHeaderLoading(label)
{
    var rightPaneLabel = jQuery('#uir-rightpaneentryform-content-title');
    var rightPaneLoadingBar = jQuery('#uir-rightpaneentryform-content-loading');

    if (rightPaneLabel.length > 0 && rightPaneLoadingBar.length > 0)
    {
        rightPaneLabel.hide();
        rightPaneLabel.html(label);
        rightPaneLoadingBar.show();
    }
}

function setHeaderLoadComplete(sRightPaneHeaderLabel)
{
    var rightPaneLabel = jQuery('#uir-rightpaneentryform-content-title');
    var rightPaneLoadingBar = jQuery('#uir-rightpaneentryform-content-loading');

    if (rightPaneLabel.length > 0 && rightPaneLoadingBar.length > 0)
    {
        rightPaneLoadingBar.hide();
        rightPaneLabel.html(sRightPaneHeaderLabel);
        rightPaneLabel.show();
    }

}

function loadrightpanefromsearch(sUrl, sFieldName, sLabel, sTaskId)
{
	sUrl = addParamToURL(sUrl, 'ifrmcntnr', 'T');
	if(sFieldName != null && sFieldName.length>1)
		sUrl = addParamToURL(sUrl, 'scrollfield', sFieldName);
	var rightPane = document.getElementById('div__scrollbody');
	if(sUrl == rightPane.src)
		return;
	rightPane.src = sUrl;

	var anchor = document.getElementById('linktd_'+sTaskId).firstChild;
	setHeaderLoading(anchor.innerHTML);
	makeSelectionVisible(anchor, true);
}

var elemToFocus = null;
function makeSelectionVisible(anchor, bFocus)
{
	if(anchor == null)
		return;

	if(currentSelectedItem != null)
	{
		currentSelectedItem.classList.remove('uir-rightpaneentryform-selected');
	}
	var item = anchor.parentNode;
	item.classList.add('uir-rightpaneentryform-selected');
	currentSelectedItem = item;

	if(bFocus)
	{
		var categoryContent = findClassUp(item,"uir-rightpaneentryform-category-content");
		if(categoryContent.style.display == "none")
			expandCategory(categoryContent.previousSibling);
		if(elementIsFocusable(anchor))
			anchor.focus();
		else
			elemToFocus = anchor;
	}
}

function handleSearchXML(sUrl)
{
	var request = new NLXMLHttpRequest();
	var doc;
	try
    {
		doc = nsStringToXML (request.requestURL(sUrl).getBody());
    }
    catch (e)
    {
        return;
    }

	var resultsPanel = document.getElementById("srchstp_b");
	
	while(resultsPanel.childNodes.length>0)
		resultsPanel.removeChild( resultsPanel.firstChild );

	var sSearchString = doc.getElementsByTagName('searchstring')[0].firstChild.nodeValue;
	var items = doc.getElementsByTagName('tasklink');
	if(items.length==0)
	{
		var resultItem = document.createElement("div");
		resultsPanel.appendChild(resultItem);
		resultItem.className = "uir-rightpane-search-result-item uir-rightpane-search-result-noitem";
		resultItem.innerHTML = format_message("No results for <b>{1:search keyword}</b>", sSearchString);
	}
	else
	{
		var bFirstIteration = true;
		var bHasTaskLinkResults = false;
		var bWroteOptionsHeader = false;
		var sparentcategory, scategory, stasklabel, staskurl, staskid, sformfieldname, sformfieldlabel, sformsubtablabel, loadPaneOnClick, btasklink;
		for(var i=0; i<items.length; i++)
		{
			btasklink = items[i].getElementsByTagName('btasklink')[0].firstChild.nodeValue == "T";
			sparentcategory = items[i].getElementsByTagName('sparentcategory')[0].firstChild.nodeValue;
			scategory = items[i].getElementsByTagName('scategory')[0].firstChild.nodeValue;
			stasklabel = items[i].getElementsByTagName('stasklabel')[0].firstChild.nodeValue;
			staskurl = items[i].getElementsByTagName('staskurl')[0].firstChild.nodeValue;
			staskid = items[i].getElementsByTagName('staskid')[0].firstChild.nodeValue;
			sformfieldname = items[i].getElementsByTagName('sformfieldname')[0].firstChild.nodeValue;
			sformfieldlabel = items[i].getElementsByTagName('sformfieldlabel')[0].firstChild.nodeValue;
			sformsubtablabel = items[i].getElementsByTagName('sformsubtablabel')[0].firstChild.nodeValue;
			var sformsubtabname = items[i].getElementsByTagName('sformsubtabname')[0].firstChild.nodeValue;
			if(sformsubtabname != null && sformsubtabname.length>0)
				staskurl = addParamToURL(staskurl, "selectedtab", sformsubtabname);
			loadPaneOnClick = "loadrightpanefromsearch('"+staskurl+"', '"+sformfieldname+"', '"+stasklabel+"', '"+staskid+"');"

			if(bFirstIteration && btasklink)
			{
				bHasTaskLinkResults = true;
				resultsPanel.appendChild(createSearchHeaderTr("TASKS"));
			}
			else if(bHasTaskLinkResults && !btasklink && !bWroteOptionsHeader)
			{
				bWroteOptionsHeader = true;
				bHasTaskLinkResults = true;
				resultsPanel.appendChild(createSearchHeaderTr("Within Tasks"));
			}

			var item = document.createElement("div");
			resultsPanel.appendChild(item);
			item.className = "uir-rightpane-search-result-item uir-rightpane-search-result-item-"+(btasklink?"task":"general");

			var anchor = document.createElement("A");
			item.appendChild(anchor);
			anchor.href = "javascript:void('"+stasklabel+"')";
			anchor.className = 'uir-rightpane-search-result-item-title';
			anchor.onclick = new Function(loadPaneOnClick);
			anchor.innerHTML = getTruncatedSearchResult(btasklink ? stasklabel : sformfieldlabel, sSearchString);

			var anchor = document.createElement("A");
			item.appendChild(anchor);
            anchor.href = "javascript:void('"+stasklabel+"')";
            anchor.className = 'uir-rightpane-search-result-item-path';
            anchor.onclick = new Function(loadPaneOnClick);
			anchor.appendChild( document.createTextNode( sparentcategory + " > " + stasklabel + (sformsubtablabel!=null && sformsubtablabel.length>0 ? " > " + sformsubtablabel : "") ) );
			bFirstIteration = false;
		}
	}
	panemanager.showPaneElement("search");
}

function createSearchHeaderTr(sLabel)
{
	var el = document.createElement("div");
	el.appendChild( document.createTextNode(sLabel) );
	el.className = "uir-rightpane-search-result-item-header";
	return el;
}
var MAXLENGTH = 26;

function getTruncatedSearchResult(sFieldLabel, sSearchString)
{
	var searchStringIdx = sFieldLabel.toLowerCase().indexOf(sSearchString.toLowerCase());
	var searchStringLength = sSearchString.length;
	var fieldLabelLength = sFieldLabel.length;
	var iStartIndex = 0;
	var iEndIndex = fieldLabelLength;

	if(searchStringLength == fieldLabelLength)
	{
		return "<b>"+sFieldLabel+"</b>";
	}
	else if( sFieldLabel.length >= MAXLENGTH )
	{
		var iDistanceToEnd = searchStringLength - (searchStringIdx + fieldLabelLength);
		var iRemaining = Math.max(0,MAXLENGTH-searchStringLength);
		if(iRemaining==0)
			return "<b>"+sSearchString+"</b>";
		var iSplit = Math.floor(iRemaining/2);

		if(iSplit > searchStringIdx)
			iEndIndex = searchStringIdx + searchStringLength + iSplit + (iSplit - searchStringIdx);
		else if(iSplit > iDistanceToEnd)
			iStartIndex = searchStringIdx - iSplit - (iSplit - iDistanceToEnd);
	}
	return sFieldLabel.substring(iStartIndex, searchStringIdx) + "<b>"+sFieldLabel.substring(searchStringIdx, searchStringIdx+searchStringLength)+"</b>" + sFieldLabel.substring(searchStringIdx+searchStringLength, iEndIndex);
}

function getNoItemsHtml(sSearchString)
{
	return "No items found for search: " + sSearchString;
}

function showIcon(bShow, sAnchorId)
{
	var anchor = document.getElementById(sAnchorId);
	anchor.style.display = "";
    anchor.firstChild.src = (bShow ? "/images/reportbuilder/minimizepane.gif" : "/images/reportbuilder/maximizepane.gif");
}

function expandCategory(categoryHeader)
{
	var categoryContent = categoryHeader.nextSibling;
	var expand = categoryContent.style.display == "none";

	if (expand)
	{
		categoryContent.style.display = "";
	}
	else
	{
		categoryContent.style.display = "none";
	}
	categoryHeader.setAttribute('data-expanded', expand);
}

function iframeonload()
{
	var rightPaneWindow = window.frames["div__scrollbody"];
	if(rightPaneWindow.syncChildEventHandlers)
		rightPaneWindow.syncChildEventHandlers(rightPaneWindow);
	var pageTitleField = rightPaneWindow.document.getElementById("rightpanetitle");
	setHeaderLoadComplete(pageTitleField != null ? pageTitleField.value : null);
}


function NLContentManager_showFilterPopup(span)
{
	var popup = nlOpenPopup(window, 'nlpopuplite', '/app/site/setup/sitemanager.nl?wcf=T', span, true, 500, 140);
	popup.nativeTopObject.classList.add('uir-popup');
}

var panemanager = null;

function initPaneManager(bHasButtons, sTaskId, fOnresize)
{
	panemanager = new NLPanesManager( document.getElementById("div__nav"),
									  document.getElementById("div_rightpane"),
									  document.getElementById("div__scrollbody"),
									  bHasButtons,
									  sTaskId);
	if(fOnresize)
		panemanager.paneonresize = fOnresize;
	window.onresize = paneresize;
}

var panetimer = 0;
function paneresize(e)
{
	clearTimeout(panetimer);
	panetimer = setTimeout("panemanager._onresize();",10);
}

function setStickyPref(sTaskId, sPrefname, sPrefValue, bUserPreference)
{
	try
    {
		var url = "/app/common/multistep/rightpanestickypref.nl?_tid=" + sTaskId + "&";
		var sQueryString = "_tpref=" + sPrefname + "&_tval=" + sPrefValue;
		if(bUserPreference != null && bUserPreference == true)
			sQueryString += "&_tuser=T";
		var request = new NLXMLHttpRequest();
        var nsResponse = request.requestURL( url+sQueryString, sQueryString, null, true );
        return nsResponse;
    }
    catch( e )
    {
       //throw new nlapiScriptError('REQUEST_URL_ERROR',e);
    }
}

function expandCollapseLeftPaneElement(name)
{
	panemanager.expandCollapsePane(name);
}

function _panesOnSelectStart()
{
	if(panemanager && panemanager.isDragging())
	 	return false;
}

function childPanesMouseMove(mousex)
{
	if (panemanager && panemanager.isDragging()) {
		var shift = NS.UI.Util.isRedwood ? 29 : 59;
		panemanager.positionDragDiv(panemanager.leftpanewidth + mousex + shift);
	}
}

function panesMouseMove(evnt)
{
	if (panemanager && panemanager.isDragging()) {
		panemanager.positionDragDiv(getMouseX(evnt));
	}
}

function childPanesMouseUp()
{
	if(panemanager && panemanager.isDragging())
		panemanager.endDrag();
}

function panesMouseUp(evnt)
{
	if(panemanager && panemanager.isDragging())
		panemanager.endDrag();
}

function NLPanesManager(leftpane, rightpane, contentarea, bHasButtons, sTaskId)
{
	this.leftpane = leftpane;
	this.rightpane = rightpane;
	this.contentarea = contentarea;
	this.bhasleftpane = leftpane != null;
	this.hasbuttons = bHasButtons;

	this.taskid = sTaskId;
	this.taskidpreftimer = 0;

	this.leftpaneelements = [];
	this.leftpaneelementsNameIdxMap = [];
	this.leftpanewidth = this.bhasleftpane ? leftpane.offsetWidth : 0;
	this.paneonresize = null;

	this.bDragging = false;
	this.dragDiv = null;

    this.minNavPaneWidth = 235;
    this.maxNavPaneWidth = 950;
}

NLPanesManager.prototype.setLeftPaneWidthPref = function()
{
	this.taskidpreftimer = setTimeout("setStickyPref('"+this.taskid+"','LEFTPANEWIDTH','"+this.leftpanewidth+"');",2000);
};

NLPanesManager.prototype.isDragging = function()
{
	return this.bDragging;
};

NLPanesManager.prototype.startDrag = function(evnt)
{
	this.bDragging = true;
	this.setCursor("ew-resize");
	this.showDragDiv(evnt);
};

NLPanesManager.prototype.setCursor = function(sCursor)
{
	document.body.style.cursor = sCursor;
};

NLPanesManager.prototype.endDrag = function()
{
	var iNewWidth = this.dragDiv.offsetLeft - (NS.UI.Util.isRedwood ? 0 : 20);
	this.hideDragDiv();
	this.bDragging = false;
	this.setCursor("default");
	this.setLeftPaneWidth(iNewWidth);
	this.setLeftPaneWidthPref();
	if(this.paneonresize != null)
		this.paneonresize();
};

NLPanesManager.prototype.showDragDiv = function(evnt)
{
	if(this.dragDiv == null)
	{
		this.dragDiv = document.createElement("div");
		this.dragDiv.classList.add("uir-rightpane-drag-line");
		document.querySelector("#body").appendChild(this.dragDiv);
	}

	var dragger = document.querySelector(".uir-rightpane-dragger");
	this.dragDiv.style.display = "";
	this.dragDiv.style.top = dragger.offsetTop + 'px';
	this.dragDiv.style.height = dragger.offsetHeight + 'px';
	this.positionDragDiv(getMouseX(evnt));
};

NLPanesManager.prototype.hideDragDiv = function()
{
	this.dragDiv.style.display = "none";
};

NLPanesManager.prototype.positionDragDiv = function(mousex)
{
	if(mousex > this.minNavPaneWidth && mousex < this.maxNavPaneWidth)
	{
		this.dragDiv.style.left = mousex + "px";
	}
};

NLPanesManager.prototype.setLeftPaneWidth = function(iWidth)
{
	this.leftpanewidth = iWidth;
	this.leftpane.style.width = this.leftpanewidth + "px";
};

NLPanesManager.prototype._onresize = function(e)
{
	if(this.paneonresize != null)
		this.paneonresize();
};

NLPanesManager.prototype.addLeftPaneElement = function(name, divid, bVisible)
{
	var idx = this.leftpaneelements.length;
	this.leftpaneelements[idx] = new NLLeftPaneElement(name, divid, bVisible, idx);
	if(name == "search")
		this.leftpaneelements[idx].additionalheight = 32;
	this.leftpaneelementsNameIdxMap[name] = idx;
	return this.leftpaneelements[idx];
};

NLPanesManager.prototype.showPaneElement = function(name)
{
	var elem = this.leftpaneelements[ this.leftpaneelementsNameIdxMap[name] ];
	if(!elem.visible)
		this.expandCollapsePane(name);
};

NLPanesManager.prototype.expandCollapsePane = function(name)
{
	var currentPaneIdx = this.leftpaneelementsNameIdxMap[name];

	
	var bShow = !this.leftpaneelements[currentPaneIdx].visible;

	this.leftpaneelements[currentPaneIdx].visible = bShow;
	this.leftpaneelements[currentPaneIdx].displayPane();

	
	if(currentPaneIdx <= 1)
	{
		var altIdx = currentPaneIdx == 0 ? 1 : 0;
		this.leftpaneelements[altIdx].visible = !bShow;
		this.leftpaneelements[altIdx].displayPane();
	}

	
};

function NLLeftPaneElement(sName, sDivid, bVisible, iSequence)
{
	this.name = sName;
	this.divid = sDivid;
	this.visible = bVisible;
	this.div = this.getDiv();
	this.currentSize = 0;
	this.sequence = iSequence;
	this.additionalheight = 0;
	this.stickyprefname = null;
	this.stickyprefisuser = false;
}

NLLeftPaneElement.prototype.getDiv = function()
{
	if(this.div == null)
		this.div = document.getElementById(this.divid);
	return this.div;
};

NLLeftPaneElement.prototype.getContentHeight = function()
{
	return this.getDiv().scrollHeight;
};

NLLeftPaneElement.prototype.getHeight = function()
{
	return this.getDiv().offsetHeight;
};

NLLeftPaneElement.prototype.displayPane = function()
{
	this.getDiv().style.display = this.visible ? "" : "none";
	this.setStickyPref();
};

NLLeftPaneElement.prototype.setStickyPrefName = function(sPrefname, bUser)
{
	this.stickyprefname = sPrefname;
	this.stickyprefisuser = bUser;
};


NLLeftPaneElement.prototype.setStickyPref = function()
{
	if(this.stickyprefname != null)
		setTimeout("setStickyPref('','"+this.stickyprefname+"','"+(this.visible ? "T" : "F")+"', "+this.stickyprefisuser+");",1000);
};

function wscm_iframeonload ()
{
    iframeonload();
    var rightPaneWindow = window.frames["div__scrollbody"];
    var url = rightPaneWindow.location.href;
    if (url.indexOf('manager=T') >= 0 )
        
        return;

    var id = getURLParameter("id", true, rightPaneWindow.document);
    var action = getURLParameter("modtype", true, rightPaneWindow.document);
    var nodeKey = null;
    if (id != null)
    {
        if(url.indexOf("prescategory.nl") >=0 || url.indexOf("storetabs.nl") >=0 || url.indexOf("prescategories.nl") >=0)
            nodeKey = "C:" + id;
        else if (url.indexOf("infoitem.nl") >=0 )
            nodeKey = "I:" + id;
        else if (url.indexOf("item.nl") >=0 )
            nodeKey = "A:" + id;
    }

    if (action != null && url.indexOf('e=T') == -1)
    {
        parent.tree_main.reload();
        parent.tree_uncat.reload();
    }
    if (parent.tree_main.hasNode(nodeKey))
        parent.tree_main.setFocusedNode(nodeKey);
    else if (parent.tree_uncat.hasNode(nodeKey))
    {
        parent.tree_uncat.setFocusedNode(nodeKey);
    }
    else
    {
        var nodePath = getURLParameter("tnpath", true, rightPaneWindow.document);
        if (nodePath != null)
        {
            parent.tree_main.focus(nodePath, true/*expand nodes along the path if needed*/);
            parent.tree_main.setFocusedNode(nodePath);
        }
    }
}



function getParameter1( param, doc )
{
    if (typeof doc == "undefined" || doc == null)
        doc = document;
    var re = new RegExp(".*[?&]"+param+"=([^&]*)");
    var matches = re.exec( doc.location.href.toString() ) ;
    return matches != null && matches.length > 0 ? matches[1] : null;
}

function getURLParameter( param, bUnescape, doc )
{

    var val = getParameter1(param, doc);
    if (bUnescape != false && val != null)
        val = decodeURIComponent(val);
    return val;
}
