





function isHeaderField(seq)
{
    return seq < 0;
}

function isFooterField(seq)
{
    return seq >= 1000000;
}

function isBodyField(seq)
{
    return seq >= 0 && seq < 1000000;
}
var ACTIVE_ROW_CSS_CLASS_NAME = 'movable sellisttexthl';

function OrderedListSelectLine(mach,linenum)
{
    if (document.getElementById(mach+"gripimg"+linenum) != null && document.getElementById(mach+"gripimg"+linenum).style.display == "none")
        return;
	if (window.curline == null)
		window.curline = {};
	var node1 = OrderedListGetSelectedRow(mach);
	window.curline[mach] = linenum;
	var node2 = OrderedListGetSelectedRow(mach);

	
	var toggleRow = node1 != null && node1 == node2;
    for (var idx=0; idx < node2.childNodes.length; idx++)
	{
        var className = node2.childNodes[idx].className;
        if ( toggleRow )
		{
            if (className.indexOf(ACTIVE_ROW_CSS_CLASS_NAME) != -1)
                className = className.replace (ACTIVE_ROW_CSS_CLASS_NAME, '');
            else
                className += ' ' + ACTIVE_ROW_CSS_CLASS_NAME;
			node2.childNodes[idx].className = trim(className);
		}
		else
		{
			if (node1 != null)
				node1.childNodes[idx].className = trim(node1.childNodes[idx].className.replace(ACTIVE_ROW_CSS_CLASS_NAME,''));
			node2.childNodes[idx].className += ' ' + ACTIVE_ROW_CSS_CLASS_NAME;
		}
 	}
 }
 
 function OrderedListGetSelectedRow(mach)
 {
    var returnMe = null;
    if ( window.curline != null && window.curline[mach] != null )
        returnMe = document.getElementById(mach+'row'+(parseInt(getEncodedValue(mach,window.curline[mach],mach+'seqnum'))-1));
    return returnMe;
 }
 
 function OrderedListGetSelectedRowIsMovable(mach)
 {
    var returnMe = false;
    var row = OrderedListGetSelectedRow(mach);
    if ( row != null )
        returnMe = row.childNodes[0].className.indexOf(ACTIVE_ROW_CSS_CLASS_NAME) != -1;
    return returnMe;
 }
 
 function OrderedListClearSelectedRow(mach)
 {
    if ( OrderedListGetSelectedRow(mach) != null )
    {
        OrderedListSelectLine(mach, OrderedListGetSelectedRow(mach).rowSeqnum, true);
        window.curline[mach] = null;
    }
 }
 
 function OrderedListMoveLine(mach,dir)
 {
    if (window.curline == null || window.curline[mach] == null)
        return;
    var linenum = window.curline[mach];
    var curseq = parseInt(getEncodedValue(mach,linenum,mach+'seqnum'));
	if ((curseq==document.forms[0].elements['min'+mach+'orderidx'].value && dir ==-1) || (curseq==document.forms[0].elements['max'+mach+'orderidx'].value-1 && dir == 1))
	 	return;
	OrderedListMoveLineTo(mach,curseq+dir);
 }


function determineNewSeqNum(mach, currSeq, newSeq, linenum)
{
    var minValue = document.forms[0].elements['min'+mach+'orderidx'].value;
    var maxValue = document.forms[0].elements['max'+mach+'orderidx'].value - 1;
    return Math.max(Math.min(newSeq, maxValue), minValue);
}

 
 function OrderedListMoveLineTo(mach,newseq,keepSeq)
 {
     if ( window.curline == null || window.curline[mach] == null )
        return;
	 if ( !OrderedListGetSelectedRowIsMovable(mach) )
	    return;
     var linenum = window.curline[mach];
 	 var curseq = parseInt(getEncodedValue(mach,linenum,mach+'seqnum'));
     if (!keepSeq) {
 	    newseq = determineNewSeqNum(mach, curseq, newseq, linenum);
     }
 	 if (curseq==newseq)
 		return;
	 var idx;

	  
	 var tempClasses = [];
	 var activeRow = document.getElementById(mach+'row'+(curseq-1));
     var insertAsRow = document.getElementById(mach+'row'+(newseq-1));
     if (newseq < document.forms[0].elements['max'+mach+'orderidx'].value-1)
     {
         var temprowSeqnum = document.getElementById(mach+'row'+(curseq<newseq ? newseq : newseq-1)).rowSeqnum;
         if (document.getElementById(mach+"gripimg"+temprowSeqnum) != null && document.getElementById(mach+"gripimg"+temprowSeqnum).style.display == "none")
             return;
     }

     
     for (idx=0; idx < insertAsRow.childNodes.length; idx++)
     {
         tempClasses[idx] = insertAsRow.childNodes[idx].className;
         activeRow.childNodes[idx].className = trim(activeRow.childNodes[idx].className.replace(ACTIVE_ROW_CSS_CLASS_NAME, ''));
     }

     var i,row,prevRow,nextRow,seq;
	  
	 if (curseq<newseq)
	 {
		for (i=parseInt(document.forms[0].elements['min'+mach+'orderidx'].value);i<parseInt(document.forms[0].elements['max'+mach+'orderidx'].value);i++)
		{
			seq = parseInt(getEncodedValue(mach,i,mach+'seqnum'));

 			if (seq<=newseq && seq>curseq)
 				setEncodedValue(mach,i,mach+'seqnum',seq-1);
 		}
        var lastRow = null;
        for (seq=newseq;seq>curseq;seq--)
		{
			row = document.getElementById(mach+'row'+(seq-1));
			prevRow = document.getElementById(mach+'row'+(seq-2));
			for (idx=0; idx < row.childNodes.length; idx++)
				row.childNodes[idx].className = prevRow.childNodes[idx].className;
            if (lastRow)
                lastRow.id = getRowId(mach, seq);
            lastRow = row;
         }
        if (lastRow)
            lastRow.id = getRowId(mach, seq);
     }
	  
	 else
	 {
        for (i=parseInt(document.forms[0].elements['min'+mach+'orderidx'].value);i<parseInt(document.forms[0].elements['max'+mach+'orderidx'].value);i++)
		{
		    seq = parseInt(getEncodedValue(mach,i,mach+'seqnum'));
			if (seq>=newseq && seq<curseq)
			    setEncodedValue(mach,i,mach+'seqnum',seq+1);
		}
        var lastRow = null;
		for (seq=newseq;seq<curseq;seq++)
		{
			row = document.getElementById(mach+'row'+(seq-1));
			nextRow = document.getElementById(mach+'row'+seq);
			for (idx=0; idx < row.childNodes.length; idx++)
				 row.childNodes[idx].className = nextRow.childNodes[idx].className;
            if (lastRow)
                lastRow.id = getRowId(mach, seq);
            lastRow = row;
        }
        if (lastRow)
            lastRow.id = getRowId(mach, seq);
	}

    
    activeRow.id = getRowId(mach, 0);
    var insertBeforeRow = document.getElementById(mach+'row'+ newseq);
    if (!insertBeforeRow) insertBeforeRow = null;
    activeRow.parentNode.insertBefore(activeRow, insertBeforeRow);
	for (idx=0; idx < activeRow.childNodes.length; idx++)
        activeRow.childNodes[idx].className = tempClasses[idx] + ' ' + ACTIVE_ROW_CSS_CLASS_NAME;
    activeRow.id = getRowId(mach, newseq);
    setEncodedValue(mach,linenum,mach+'seqnum',newseq);

    NS.form.setChanged(true);
    eval(mach+"MovedLine("+curseq+","+newseq+")");
	
}

function getNextMachineSeq(mach)
{
    return document.forms[0].elements['next'+mach+'idx'].value;
}


function OrderedListInitSeqnums(mach)
{
	var i = 1;
	for (; i < getNextMachineSeq(mach);i++ )
    {
        var row = document.getElementById(mach+'row'+(i-1));
        
        row.rowSeqnum = i;
        row.machineName = mach;
        row.isOrderedList = true;
		row.onselectstart = OrderedListCancelDragDrop;

        
        
        setEncodedValue(mach,i,mach+'seqnum',i);
        row.onclick = OrderedListOnClick;
	    row.onmousedown = OrderedListOnMouseDown;
	    row.onmousemove = OrderedListOnMouseMove;
    }
}

function OrderedListGetRowFromEvent(evnt)
{
	var target = getEventTarget(evnt);
	return OrderedListGetRowFromTarget(target);
}

function OrderedListGetRowFromTarget(target)
{
	while (target != null)
	{
		if (OrderedListIsTargetInput(target))
			break;
		if (target.nodeName == "TR")
			break;
		target = target.parentNode;
	}
	if (target == null || target.nodeName != "TR")
		return null;
	return target;
}


function OrderedListMarkRowNavigation(row, mark)
{
    
    if(ordereddragger.trToBeMoved.rowIndex < row.rowIndex)
    {
        row = row.parentNode.rows[row.rowIndex + 1 ];
    }

	if ( row == null ) 
		return;

	if ( mark )
	{
        for ( var i = 0; i < row.childNodes.length; i++ )
            row.childNodes[i].style.borderTop='#8491A4 1px solid';
	}
	else
	{
		for (i = 0; i < row.childNodes.length; i++ )
			row.childNodes[i].style.borderTop = 'white 1px solid';
	}
}




var ordereddragger;
function OrderedListInitDragger(element, usediv)
{
  // I wrapped this entire method in a try/catch just to be safe.
  // If anything goes wrong here, we'll just do nothing to the layout
  try
  {
    ordereddragger = new NLPortletDragger();
    // grab the TR that contains the portlet and get the other objects we need to position it properly
    ordereddragger.trToBeMoved = element;
    ordereddragger.originalContainer = element.parentNode;
    ordereddragger.originalNext = element.nextSibling;
    ordereddragger.width = element.offsetWidth;

    if ( usediv )
    {
		// create the temporary div that we will drag around with the portlet in it
		ordereddragger.divContainer = document.createElement("div");
		ordereddragger.divContainer.style.position = "absolute";
		ordereddragger.divContainer.style.width = ordereddragger.width;
		ordereddragger.divContainer.style.background = document.body.bgColor;
		ordereddragger.divContainer.style.padding = "0px";
		ordereddragger.divContainer.style.borderWidth = 0;
		ordereddragger.divContainer.style.borderColor = "#999999";   // we're just giving it a gray border for now.
		ordereddragger.divContainer.style.borderStyle = "solid";

		ordereddragger.originalContainer.removeChild(element);

		var eTable = document.createElement("table");
		eTable.style.borderWidth = 0;
		eTable.cellSpacing = 0;
		eTable.cellPadding = 0;
		eTable.width = "100%";
		var tBody = document.createElement("tbody");
		eTable.appendChild(tBody);
		tBody.appendChild(element);
		ordereddragger.divContainer.appendChild(eTable);
		document.body.appendChild(ordereddragger.divContainer);
    }

    // calculate the position of the floating portlet div that will follow the mouse
    if ( ordereddragger.divContainer )
        positionFloatingPortlet(ordereddragger.divContainer, 4);
  }
  catch (e) { }
}

function OrderedListOnMouseMove(evnt)
{
	// update the mouse position
	updateMousePosition(evnt);

	if ( ordereddragger )
	{
		if ( ordereddragger.divContainer )
            positionFloatingPortlet(ordereddragger.divContainer, 4);
        // keep track of where we are row-wise
        var elem = OrderedListGetRowFromEvent(evnt);
		if ((elem != null) && (elem != currentPortlet) && elem != ordereddragger.trToBeMoved)
		{
			if (currentPortlet != null && currentPortlet.parentNode != null)
				OrderedListMarkRowNavigation(currentPortlet, false);
			currentPortlet = elem;
			OrderedListMarkRowNavigation(currentPortlet, true);
		}
        setEventCancelBubble(evnt);
        setEventPreventDefault(evnt);
    }
}

function OrderedListOnClick(evnt)
{
	var target = getEventTarget(evnt);
	if (OrderedListIsTargetInput(target))
		return;
	target = OrderedListGetRowFromEvent(evnt);
	if ( target == null  )
		return;
	OrderedListSelectLine(target.machineName, target.rowSeqnum);
}


function OrderedListOnMouseDown(evnt)
{
	var target = getEventTarget(evnt);
	if (OrderedListIsTargetInput(target))
		return;
	target = OrderedListGetRowFromEvent(evnt);
	if ( target == null  )
		return;
	if ( target.isOrderedList && target != OrderedListGetSelectedRow(target.machineName) )
		return;
	if ( !target.isOrderedList && !target.selectedRow )
		return;

	if ( ordereddragger )
	   return;
	if ( target != null )
		OrderedListInitDragger(target);
    setEventCancelBubble(evnt);
    setEventPreventDefault(evnt);
}

function OrderedListOnMouseUp()
{
	if ( ordereddragger )
	{
		ordereddragger.putDownRow();
		ordereddragger = null;
		return false;  // if the user dropped the portlet on a link, don't navigate away
	}
}


function OrderedListCancelDragDrop(evnt)
{
	if ( ordereddragger )
	{
        setEventCancelBubble(evnt);
        setEventPreventDefault(evnt);
    }
}

function OrderedListDebugMachine(mach)
{
    var d = '';
    for (var i=document.forms[0].elements['min'+mach+'orderidx'].value;i<document.forms[0].elements['max'+mach+'orderidx'].value;i++)
	    d += (isValEmpty(d) ? '' : ',') + (window.curline[mach] == i ? '*' : '') + getEncodedValue(mach,i,'kName')+':'+getEncodedValue(mach,i,mach+'seqnum');
    window.status=d;
}

function getRowId(mach, seqNum)
{
    return mach+'row'+parseInt(seqNum-1);
}

function OrderedListIsTargetInput(target) {
	if (!target || target.nodeType !== Node.ELEMENT_NODE) {
		return false;
	}

	var nodeName = target.nodeName;
	if (nodeName === "INPUT" || nodeName === "SELECT" || nodeName === "TEXTAREA") {
		return true;
    }

    return target.closest('.uir-select-input-container') !== null;
}