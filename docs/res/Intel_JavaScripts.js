/* Java Script utilities for Gladiator CDC report */
/*
** =============================================== Modification History  ===============================================
25-May-2012:
BAM - Created the file and added following functionalities. This is to avoid adding JavaScript functions to the HTML file directly
	- Pop-up window with help
	- combine and color code multiple classifications belonging to the same call drop within a log file and combine and color code multiple call drops per file

21-Nov-2012:
RR - Added 	modCDComparisonTable (cdComparisonTable), delRCfromCDComparisonCol1(cdComparisonTable), delRCfromCDComparisonCol2(cdComparisonTable), delRCfromCDComparisonCol3(cdComparisonTable), delRCfromCDComparisonCol4(cdComparisonTable), 		combineClassificationsfromCDComparisonCol1(cdComparisonTable), combineClassificationsfromCDComparisonCol2(cdComparisonTable), 		combineClassificationsfromCDComparisonCol3(cdComparisonTable) and necombineClassificationsfromCDComparisonCol4(cdComparisonTable). These functions are used to format the "Call Drops Comparison" table. 'Drop' has been replaced with the actual call classifications. Rows containing "radio_conditions" are removed and call drops with multiple classifications are grouped in one cell.

26-Nov-2012:
RR - Combined all of the delRCfromCDComparisonColx functions into one (delRCfromCDComparison). Combined all of the combineClassificationsfromCDComparisonColx functions into one (combineClassificationsfromCDComparison).

12-Dec-2012:
BAM - Added Graphing functionality

19-Jan-2013:
BAM - Fine-tuned the graphing functionality to take care of some data points going "out of the chart"

21-Jan-2013:
BAM - Changed the filter for "Radio Conditions" column from "select" to a text field

19-May-2013:
BAM - Removed "Radio Conditions Only" specific functionality since LTE implementation does not have that anymore

20-Sep-2013:
BAM - Changed the graphing engine from Raphael to HighCharts

31-Jan-2014:
BAM - Added functionality to use Google Maps bacground to map the data instead of static map images

03-Feb-2014:
BAM - Cleaned up combineClassificationsfromCDComparison() function to get rid of all "Cases" and handle the logic in a much simpler way
	- Modified combineClassifications() function to make the repeated file names "invisible" rather than completely remove them

25-Feb-2014:
BAM - Added basic framework to create a file from HTML table content. Currently supports creation of STT marker file

01-Apr-2014:
BAM - Updated the line chart graphing functionality to be able to plot a combination of different series onto the same canvas
	- Regardless of wether the series ranges match or not, they will all be scaled for user clarity
	
10-May-2014:
BAM - Updated Google Maps interface to support multiple markers from the same row of the table
*/

/*
**===================================================
** GENERIC FUNCTIONS
**===================================================
*/

/* Function to check if a substring is contained in the source string */
function containsString(srcString, subString)
{
	if(srcString.indexOf(subString) != -1)
		return true;
	else
		return false;
}

/* Popup window code */
function newPopup(url)
{
	popupWindow = window.open(
		url,'popUpWindow','height=300,width=600,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes')
}

/*
**===================================================
** TABLE MODIFICATION FUNCTIONS
**===================================================
*/

/* Function to alter colors for log files */
function altLogFileColors(eventsTable, logFiles)
{
   	var rows = eventsTable.getElementsByTagName("tr");
	var logColors = new Array(); /* Colors for log files */
	logColors[0] = "#FFFFFF"; /* Default color - White */
	logColors[1] = "#FBEBA4"; /* Light Orange */
	var logFileNameTracker = 0; /* Track log file name change */
	var logFileNameCol = 2; /*Column # that contains trace log file names */

	for(i = 1; i < rows.length; i++) /* Ignore the first row (idx 0) as it is the TITLE row */
	{
		var prevLogCellContent = jQuery(jQuery(eventsTable)[0].rows[i-1].cells[logFileNameCol]).text();
		var curLogCellContent = jQuery(jQuery(eventsTable)[0].rows[i].cells[logFileNameCol]).text();
		if(curLogCellContent != prevLogCellContent) /* Start of a new log block */
		{
			logFiles[logFileNameTracker] = i; /* Mark the beginning of each log file block */
			logFileNameTracker++;
		}
		for(j = 0; j < rows[i].cells.length; j++) /* Individually color each cell. Coloring the whole row is not working */
		{
			eventsTable.rows[i].cells[j].style.backgroundColor = logColors[(logFileNameTracker - 1)% 2]; /* Toggle between the two pre-defined colors */
		}
	}
	logFiles[logFileNameTracker] = rows.length; /* This is for the last log file block */
	
	return 	logFileNameTracker; /* At the end, this should be equal to the number of log files in the report */
}

/* Function to color multiple call drops within a single log file */
function altColorsForCallDropsInLogFile(eventsTable, logFiles, logFileNameTracker)
{
	var timeColors = new Array(); /* Colors for call drops within a given log file block */
	timeColors[0] = "#D1D1D1"; /* Grey */
	timeColors[1] = "#F1F1F1"; /* Light Greay */
	var timeColTracker = 0; /* Track time changes within a log file block */
	var logFileNameCol = 2 /* Column # in which the log file name is present */
	var timeCol = 3; /* Column # in which the timestamp is present */
	var classificationCol = 4; /* Column # in which the call drop classification is present */
	var callStatsCol = 5; /* Column # in which the Call Stats are present */

	for(k = 0; k < logFileNameTracker; k++) /* Iterate through each log file block */
	{
		var logFileBlock = (logFiles[k+1] - logFiles[k]); /* # of rows in each log file block */
		for(l = logFiles[k]; l < logFiles[k+1]; l++) /* Iterate through each row within a log file block */
		{
			var prevTimeCellContent = jQuery(jQuery(eventsTable)[0].rows[l-1].cells[timeCol]).text();
			var curTimeCellContent = jQuery(jQuery(eventsTable)[0].rows[l].cells[timeCol]).text();
			if(logFileBlock > 1) /* Check for time difference only if there is more than one CD in the log file */
			{
				if(curTimeCellContent != prevTimeCellContent) /* Mark the change of time. This indicates a new call drop */
				{
					timeColTracker++;
				}
			}
			else
			{
				timeColTracker++;
			}
			
			/* Toggle between the two pre-defined colors for "TIme", "Classification" and "Call Stats" columns */
			eventsTable.rows[l].cells[timeCol].style.backgroundColor = timeColors[timeColTracker % 2];
			eventsTable.rows[l].cells[classificationCol].style.backgroundColor = timeColors[timeColTracker % 2];
			eventsTable.rows[l].cells[callStatsCol].style.backgroundColor = timeColors[timeColTracker % 2];
		}
	}
}

/* Combine classifications belonging to the same Call Drop */
function combineClassifications(eventsTable, logFileNameTracker)
{
	var totalRows = eventsTable.getElementsByTagName("tr").length;
	var fileIDCol = 1; /* Column # in which the file ID is present */
	var fileNameCol = 2; /* Column # in which the name of the file is present */
	var timeCol = 3; /* Column # in which the timestamp is present */
	var classificationCol = 4; /* Column # in which the call drop classification is present */
	var classificationCol = 4; /* Column # in which the call drop classification is present */
	var callStatsCol = 5; /* Column # in which the call stats info is present */
	var addInfoCol = 6; /* Column # in which additional info is present */
	
	/* Go "up" the eventstable starting with the last row */
	for(i = (totalRows - 1); i > 1; i--)
	{
		/* Get the contents of the desired columns for the "current" and "previous (current - 1)" rows*/
		var prevFileNameCellContent = jQuery(jQuery(eventsTable)[0].rows[i-1].cells[fileNameCol]).text();
		var curFileNameCellContent = jQuery(jQuery(eventsTable)[0].rows[i].cells[fileNameCol]).text();
		var prevTimeCellContent = jQuery(jQuery(eventsTable)[0].rows[i-1].cells[timeCol]).text();
		var curTimeCellContent = jQuery(jQuery(eventsTable)[0].rows[i].cells[timeCol]).text();

		/* If the timestamp and filename of the current row is same as the timestamp and filename of the previous row, 
		 * the classifications belongs to the same CD in the same file
		 */
		if((curFileNameCellContent == prevFileNameCellContent) && (curTimeCellContent == prevTimeCellContent))
		{
			eventsTable.rows[i - 1].cells[classificationCol].style.fontSize = "12px";
			eventsTable.rows[i - 1].cells[callStatsCol].style.fontSize = "12px";
			eventsTable.rows[i - 1].cells[addInfoCol].style.fontSize = "12px";
			/* Combine classifications */
			jQuery(jQuery(eventsTable)[0].rows[i-1].cells[classificationCol]).text(jQuery(jQuery(eventsTable)[0].rows[i-1].cells[classificationCol]).text() + "-----" + jQuery(jQuery(eventsTable)[0].rows[i].cells[classificationCol]).text());
			/* Combine Additional Info */
			jQuery(jQuery(eventsTable)[0].rows[i-1].cells[addInfoCol]).text(jQuery(jQuery(eventsTable)[0].rows[i-1].cells[addInfoCol]).text() + "-----" + jQuery(jQuery(eventsTable)[0].rows[i].cells[addInfoCol]).text());
			jQuery(jQuery(eventsTable)[0].rows[i]).remove();
		}
	}
	
	/* Remove multiple instances of the same file name */
	for(j = (eventsTable.getElementsByTagName("tr").length - 1); j > 1; j--)
	{
		if(jQuery(jQuery(eventsTable)[0].rows[j].cells[fileNameCol]).text() == jQuery(jQuery(eventsTable)[0].rows[j-1].cells[fileNameCol]).text())
		{
			/* Following is being done to make the filter work properly for multiple rows with same file name.
			** File name cannot be removed if the filter should find all instances of it, at the same time we don't want all the instances to be visible to the end user.
			** Set the font color of the repeated instances to be same as the background color of the correponding cell so that the file name is there but invisible
			** Now remove the hyperlink to the file since the hyperlink makes the color blue regardless
			*/
			eventsTable.rows[j].cells[fileNameCol].style.color = eventsTable.rows[j].cells[fileNameCol].style.backgroundColor;
			jQuery(jQuery(eventsTable)[0].rows[j].cells[fileNameCol]).text(jQuery(jQuery(eventsTable)[0].rows[j].cells[fileNameCol]).text());
			eventsTable.rows[j].cells[fileIDCol].style.color = eventsTable.rows[j].cells[fileIDCol].style.backgroundColor;
			jQuery(jQuery(eventsTable)[0].rows[j].cells[fileIDCol]).text(jQuery(jQuery(eventsTable)[0].rows[j].cells[fileIDCol]).text());
		}
	}
}


/* Combine classifications belonging to the same Call Drop */
function combineClassificationsfromCDComparison(cdComparisonTable)
{
	var totalRowsCDCompTable = cdComparisonTable.getElementsByTagName("tr").length;
	var timeColCDComparison = 0; /* Column # in which the timestamp is present */
	var classificationColumns = [1,2,3,4] /* Column # in which the call drop classification is present; DUT1, DUT2, DUT3, Reference */
	
	// We need to do this for all 4 "devices" columns
	for (n = 0; n < classificationColumns.length; n++)
	{
		/* Go "up" the cdComparisontable starting with the last row */
		for(i = (totalRowsCDCompTable - 1); i > 1; i--)
		{
			/* Get the contents of the desired columns for the "current" and "previous (current - 1)" rows*/
			var prevTimeCellContent1 = jQuery(jQuery(cdComparisonTable)[0].rows[i-1].cells[timeColCDComparison]).text();
			var curTimeCellContent1 = jQuery(jQuery(cdComparisonTable)[0].rows[i].cells[timeColCDComparison]).text();
			/* If the timestamp and filename of the current row is same as the timestamp and filename of the previous row, 
			 * the classifications belongs to the same CD in the same file
			 */
			if(curTimeCellContent1 == prevTimeCellContent1)
			{
				var prevClass = jQuery(jQuery(cdComparisonTable)[0].rows[i-1].cells[classificationColumns[n]]).text();
				var curClass = jQuery(jQuery(cdComparisonTable)[0].rows[i].cells[classificationColumns[n]]).text();
				var combinedClass = prevClass + '\n' + curClass;
				//alert(combinedClass);
				cdComparisonTable.rows[i-1].cells[classificationColumns[n]].style.fontSize = "12px";
				/* BAM - Enable the line below when you figure out how to get a new line using jQuery. Till then, Firefos is not supported for this */
				//jQuery(jQuery(cdComparisonTable)[0].rows[i-1].cells[classificationColumns[n]]).html(combinedClass.replace(/\n/g, '<br/>'));
				cdComparisonTable.rows[i-1].cells[classificationColumns[n]].innerText = cdComparisonTable.rows[i].cells[classificationColumns[n]].innerText + '\n' + cdComparisonTable.rows[i-1].cells[classificationColumns[n]].innerText;
				/* Delete the redundant rows when dealing with the last column (i.e. we are done with all the others) */
				if(n == (classificationColumns.length - 1))
				{
					cdComparisonTable.deleteRow(i);
				}
			}
		} // end for i loop
	} // end for n loop
}

/* Adjust the row numbers */
function adjustRowNumbers(eventsTable)
{
	var totalRows = eventsTable.getElementsByTagName("tr").length;
	for(i = 1; i < totalRows; i++)
	{
		eventsTable.rows[i].cells[0].style.fontSize = "12px";
		jQuery(jQuery(eventsTable)[0].rows[i].cells[0]).text(i);
	}
}

/* Add filters to the columns in the eventstable
 * col_0: Row number. Do not display a filter
 * col_4: Call Drop Classification. Display a drop-down menu
 * col_5: Call Stats. Display a drop-down menu
 * All other columns; display a text field for the user to type anything
 */
function addColFltrsToEventsTbl(eventsTable)
{
	var eventsTableFilters = {
		btn: true,
		col_0: "none",
		col_4: "select",
		display_all_text: " [ Filter - Show All ] ",
		btn_text: " > "
	}
	setFilterGrid(eventsTable,1,eventsTableFilters);
}

/* 
 * modTable created in Main_report.htm:
 * <BODY contentEditable=false onload="modTable('Events_Table', 'CallDrop_Comp_Table')" scroll=auto>
function modTable (eventsTable, cdComparisonTable)
{
	modEventsTable(eventsTable);
	modCDComparisonTable (cdComparisonTable);
}
*/

 	
/* Main function to modify "Events" table */
function modEventsTable(eventsTableIDs)
{
 	if(document.getElementsByTagName)
	{
			
		var eventsTable = [];
				
		for(var tableIdCntr = 0; tableIdCntr < eventsTableIDs.length; tableIdCntr++)
		{
			eventsTable[tableIdCntr] = document.getElementById(eventsTableIDs[tableIdCntr]); // Uses the value of id for "Events_Table" in the HTML document.
			if(eventsTable[tableIdCntr])
			{
				var logFileBlocks = new Array();
				logFileBlocks[0] = 1; /* Initialize the array to point to the first log file block */
				
				/* Needed to handle conflict between Prototype and jQuery.
				** jQuer(jQuer()) is used instead of $($()) evrywhere below, for the same reason.
				*/
				jQuery.noConflict();
				
				/* Call the funtion that handles coloring log file blocks */
				logFileNameTracker = altLogFileColors(eventsTable[tableIdCntr], logFileBlocks);
				
				/* Call the funtion that handles coloring of multiple call drops within a single log file */
				altColorsForCallDropsInLogFile(eventsTable[tableIdCntr], logFileBlocks, logFileNameTracker);
				
				/* Combine classifications */
				combineClassifications(eventsTable[tableIdCntr], logFileNameTracker);

				/* Re-adjust the row numbers after all these manipulations */
				adjustRowNumbers(eventsTable[tableIdCntr])
				
				/* Add filters to the columns
				 * IMPORTANT TO CALL THIS FUNCTION AT THE END SINCE THE FILTERs SHOULD TO BE APPLIED ON THE FINALLY MODIFIED TABLE
				 */
				addColFltrsToEventsTbl(eventsTableIDs[tableIdCntr])
			}
		}
	} 
}

/* Main function to modify "Call Drop Comparison" table */
function modCDComparisonTable(cdComparisonid)
{
 	if(document.getElementsByTagName)
	{
	    var cdComparisonTable = document.getElementById(cdComparisonid); // Uses the value of id for "CallDrop_Comp_Table" in the HTML document.
		var logFileBlocks = [];
		logFileBlocks[0] = 1; /* Initialize the array to point to the first log file block */

		/* Call the functions that deletes 'radio_conditions' from DUT1, DUT2, DUT3 and Reference columns */
		// We can uncomment this if we decide to remove radio conditions from the classifications
		//delRCfromCDComparison(cdComparisonTable);

		/* Combine classifications */
		combineClassificationsfromCDComparison(cdComparisonTable);
	}	
}

/* Function to modify "Classification/FileID mapping" table */
function modClassFileIDsTable(classFileIDsTableID)
{
	if(document.getElementsByTagName)
	{
		var classFileIDsTable = document.getElementById(classFileIDsTableID);
		
		if(classFileIDsTable)
		{
			var numClassFileIDsTableRows = classFileIDsTable.getElementsByTagName("tr").length;;
			/* Go through the table and add the number of occurences next to the file ID */
			for(var i = (numClassFileIDsTableRows - 1); i >= 0; i--)
			{
				jQuery(jQuery(classFileIDsTable)[0].rows[i].cells[1]).text(jQuery(jQuery(classFileIDsTable)[0].rows[i].cells[1]).text() + " (" + jQuery(jQuery(classFileIDsTable)[0].rows[i].cells[2]).text() + ")");
				jQuery(jQuery(classFileIDsTable)[0].rows[i].cells[2]).remove();
			}

			/* Set the title row text to bold */
			classFileIDsTable.rows[0].cells[1].style.fontWeight = "bold";
			
			/* Go through the table again and combine file IDs with the same classification */
			for(var i = (numClassFileIDsTableRows - 1); i > 0; i--)
			{
				if((jQuery(jQuery(classFileIDsTable)[0].rows[i].cells[0]).text()) == (jQuery(jQuery(classFileIDsTable)[0].rows[i - 1].cells[0]).text()))
				{
					jQuery(jQuery(classFileIDsTable)[0].rows[i - 1].cells[1]).text(jQuery(jQuery(classFileIDsTable)[0].rows[i - 1].cells[1]).text() + ", " + jQuery(jQuery(classFileIDsTable)[0].rows[i].cells[1]).text());
					jQuery(jQuery(classFileIDsTable)[0].rows[i]).remove();
				}
			}
		}
	}
}

/*
**===================================================
** GRAPHING FUNCTIONS
**===================================================
*/
/*======================= LINE GRAPHS =======================*/
/* 
** Main function to generate "spline" charts
** @lineChartDivID: "DIV" in which to draw the graph
** @lineChartTableID: Table from which the graph data is extracted
** @graphParams: Graph parameters object (titles, thresholds etc.)
** @buttonID: Button that needs to be disabled after a graph is plotted
*/
/* Colors for different series */
var seriesColors = ['#4572A7', '#AA4643', '#89A54E', '#0000CC', '#FFCC00', '#FF0000', '#666633', '#006666'];

function drawLineChart(lineChartDivID, lineChartTableID, graphParams)
{
	if(document.getElementsByTagName)
	{
	
		/* FOR PERFORMANCE EVALUATION PURPOSE ONLY! */
		//var startTime = new Date().getTime();
		
		/* Initialization of variables */
		var minYSeriesVal, flagEventCol;
		var arrYSeriesLabels, arrXSeries, arrYSeries, arrYSeriesWithFlags, arrBandInfo;
		var arrYAxis = new Array();
		var ySeriesInfo = new Object();
		var lineChartTable = document.getElementById(lineChartTableID);

		if(lineChartTable)
		{
			/* Get X-series values */
			arrXSeries = getLineChartXSeries(lineChartTable);
			/* Update the table to fill in empty Y-series values. This function also returns the "events" column number if it is there in the table.
			** -1 is returned if FlagEvent column does not exist but the table has at least one valid entry among all Y-series columns and rows
			** -2 is returned if all Y-series columns and their corrsponding rows are empty
			*/
			flagEventCol = updateTable(lineChartTable);
			/* If all Y-series entries are empty, there is nothing to plot. So inform the user and exit */
			if(flagEventCol != -2)
			{
				/* Get Y-series labels */
				arrYSeriesLabels = getLineChartYSeriesLabels(lineChartTable, flagEventCol, combinedChartParams.userDefinedSeries);
				
				/* Get yAxis configuration parameters */
				if(graphParams.combined == true)
				{
					arrYAxis = getCombinedGraphYAxis(arrYSeriesLabels);
				}
				else
				{
					arrYAxis = [{
						title: { text: graphParams.yTitle },
						type: 'logarithmic'
					}];
				}
				
				/* Get all the Y-series configuration parameters (labels, values, ids etc.)
				 * Also get the minimum of all Y values. This is being done here to avoid parsing the table multiple times
				 */
				ySeriesInfo = getYSeriesInfo(lineChartTable, arrYSeriesLabels, flagEventCol, graphParams.combined);
				arrYSeries = ySeriesInfo.ySeriesParamArray;
				
				/* Following is needed only if the graph is not a "combination" graph */
				if(graphParams.combined != true)
				{
					minYSeriesVal = ySeriesInfo.minAllYValues;
					/* Add the "flags" option to the end of the Y-series array */
					arrYSeriesWithFlags = getYSeriesWithFlags(lineChartTable, arrYSeries, flagEventCol, graphParams.flagSeries);
					/* Get the "band" info array to mark different thresholds (only when defined) */
					if(graphParams.bandInfo != null)
					{
						arrBandInfo = getBandInfo(graphParams.bandInfo);
					}
				}
		
				//alert(arrYSeries[0].data);
		
				/* FOR PERFORMANCE EVALUATION PURPOSE ONLY! VALUE RETURNED IS IN MILLISECONDS */
				//alert((new Date().getTime()) - startTime);
		
				/* Plot the graph (if "type" is not set by the caller, 'spline' is used as rhe default) */
				var chart = new Highcharts.Chart({
					chart: {
						renderTo: lineChartDivID,
						type: (graphParams.lineType == null ? 'spline' : graphParams.lineType),
						zoomType: 'x',
						spacingRight: 20
					},
					title: {
						text: graphParams.mainTitle,
						x: -20 //center
					},
					xAxis: [{
						minTickInterval: (Math.ceil(arrXSeries.length/25)), /* Only 50 points on X-axis */
						title: { text: graphParams.xTitle },
						categories: arrXSeries,
						labels: {
							rotation: 45,
							align: 'left'
						}
					}],
					scrollbar: { enabled: true },
					yAxis: arrYAxis,
					tooltip: { 
						valueSuffix: '', /* Place holder for units to be displayed for Y values */
						crosshairs: true,
						shared: true
					},
					series: ((graphParams.combined == true) ? arrYSeries : arrYSeriesWithFlags),
					plotOptions: { 
						line: {
							marker: { enabled: false },
							shadow: { enabled: false }
						},
						spline:{
							marker: { enabled: false },
							shadow: { enabled: false }
						},
						series: {
							animation: true,
							connectNulls: true
						}
					}
				});
			}
			else /* Display pop-up for empty table */
			{
				alert(lineChartTableID + ': Data required to generate this graph does not exist!');
			} /* END if(flagEventCol != -2) - else */
		}
		else /* Display pop-up for non-existing table */
		{
			alert(lineChartTableID + ': Data required to generate this graph does not exist!');
		} /* END if(lineChartTable) - else */
	} /* END if(document.getElementsByTagName)*/
}


/* Get the 'X' series values from the table */
function getLineChartXSeries(lineChartTable)
{
	var x_series = new Array();
		
	for(i = 1; i < lineChartTable.rows.length; i++)
	{
		x_series[i-1] = jQuery(jQuery(lineChartTable)[0].rows[i].cells[0]).text();
	}
	return x_series;
}

/* Fill in the empty rows in the table with last non-empty row value */
function updateTable(tableToUpdate)
{
	var firstRowIsEmpty = new Array();
	var lastNonEmptyRowContent, numColsToUpdate, flagEventCol = -1;
	
	/* See if the table has "FlagEvent" column */
	for(var titleCntr = 1; titleCntr < tableToUpdate.rows[0].cells.length; titleCntr++)
	{
		/* The reason why there are SO MANY EXPLICIT jQUERY calls below is BECAUSE OF IE!!! */
		if(jQuery.trim(jQuery(jQuery(tableToUpdate)[0].rows[0].cells[titleCntr]).text()) == 'FlagEvent')
		{
			flagEventCol = titleCntr;
		}
	}
	
	/* If there are events to be flagged, the last two columns are events related columns. Else all the columns except the first are Y-series columns */
	numColsToUpdate = (flagEventCol == -1 ? (tableToUpdate.rows[0].cells.length - 1) : (flagEventCol - 1));
	
	/* If the first row itself is empty, it needs special handling since the content from the first non-empty row
	** should be filled into the first set of empty rows. Ignore the last two columns as they are for mobility events (length - 2)
	*/
	for(var colCnt = 0; colCnt < numColsToUpdate; colCnt++)
	{
		if(jQuery.trim(jQuery(jQuery(tableToUpdate)[0].rows[1].cells[colCnt + 1]).text()) == "")
		{
			firstRowIsEmpty[colCnt] = "TRUE";
		}
		else
		{
			firstRowIsEmpty[colCnt] = "FALSE";
		}
	}
	
	/* Iterate through each column of the table. Ignore the last two columns as they are for mobility events (length - 2) */
	for(var colCnt = 0; colCnt < numColsToUpdate; colCnt++)
	{
		/* Iterate through each row of the particular column */
		for(var rowCnt = 1; rowCnt < tableToUpdate.rows.length; rowCnt++)
		{
			/* Take care of empty rows */
			if(jQuery.trim(jQuery(jQuery(tableToUpdate)[0].rows[rowCnt].cells[colCnt + 1]).text()) != "")
			{
				/* Check to see if we already took care of the first block of empty rows */
				if(firstRowIsEmpty[colCnt] == "TRUE")
				{
					for(var emptyRowCnt = 1; emptyRowCnt < rowCnt; emptyRowCnt++)
					{
						//jQuery(jQuery(tableToUpdate)[0].rows[emptyRowCnt].cells[colCnt + 1]).text(jQuery(jQuery(tableToUpdate)[0].rows[rowCnt].cells[colCnt + 1]).text());
						jQuery(jQuery(tableToUpdate)[0].rows[emptyRowCnt].cells[colCnt + 1]).text("null");
					}
					firstRowIsEmpty[colCnt] = "FALSE";
				}
				else
				{
					lastNonEmptyRowContent = jQuery(jQuery(tableToUpdate)[0].rows[rowCnt].cells[colCnt + 1]).text();
				}
			}
			/* Fill rest of the empty rows with last non-empty row value */
			if((jQuery.trim(jQuery(jQuery(tableToUpdate)[0].rows[rowCnt].cells[colCnt + 1]).text()) == ""))
			{
				//jQuery(jQuery(tableToUpdate)[0].rows[rowCnt].cells[colCnt + 1]).text(lastNonEmptyRowContent);
				jQuery(jQuery(tableToUpdate)[0].rows[rowCnt].cells[colCnt + 1]).text("null");
			}
		}
	}

	/* Check if all the columns are completely empty */
	var numEmptyCols = 0;
	for(var cntr = 0; cntr < numColsToUpdate; cntr++)
	{
		if(firstRowIsEmpty[cntr] == "TRUE")
		{
			numEmptyCols++;
		}
	}

	/* If all the rows of all the Y-series columns are empty, return -2 */
	if(numEmptyCols == numColsToUpdate) { flagEventCol = -2; }
	
	return flagEventCol;
}

/* Get the 'Y' series labels from the table */
function getLineChartYSeriesLabels(lineChartTable, flagEventCol, userDefined)
{
	var lineChartLegend = new Array();
	var numYSeriesLabels = 0;
	
	/* If there are events to be flagged, the last two columns are events related columns. Else all the columns except the first are Y-series columns */
	var numTotalYSeriesLabels = (flagEventCol == -1 ? (lineChartTable.rows[0].cells.length - 1) : (flagEventCol - 1));
	/* Go through the first row of each Y-series column to get its label (ignore 1st column as it is X-series) */
	for(var i = 0; i < numTotalYSeriesLabels; i++)
	{
		var colLabel = jQuery(jQuery(lineChartTable)[0].rows[0].cells[i+1]).text();
		if(userDefined)
		{
			if(document.getElementById(colLabel))
			{
				if(document.getElementById(colLabel).checked)
				{
					lineChartLegend[numYSeriesLabels] = colLabel;
					numYSeriesLabels++;
				}
			}
		}
		else
		{
			lineChartLegend[numYSeriesLabels] = colLabel;
			numYSeriesLabels++;
		}
	}
	
	return lineChartLegend;
}

/* Create the array for yAxis configuration parameters */
function getCombinedGraphYAxis(ySeriesLabels)
{
	var yAxisArray = new Array();
	
	for(var yAxisCnt = 0; yAxisCnt < ySeriesLabels.length; yAxisCnt++)
	{
		yAxisArray[yAxisCnt] = {
			labels: {
				formatter: function() {
					return this.value;
				},
				style: {
					color: seriesColors[yAxisCnt]
				}
			},
			opposite: (yAxisCnt%2 == 0 ? true : false),
			title: {
				text: ySeriesLabels[yAxisCnt],
				style: {
					color: seriesColors[yAxisCnt]
				}
			}
		};
	}
	
	return yAxisArray;
}

/* Create the array of y-series parameters needed by the graphing function */
function getYSeriesInfo(lineChartTable, yLabels, flagEventCol, combined)
{
	var ySeriesArray = new Array(); /* This ultimately will be a 2D array - [[series1-vals], [series2-vals], [series3-vals]...] */
	var minYSeriesValArray = new Array();
	var numYSeries;
	var gysiYSeriesInfo = new Object();
	var ySerCnt = 0;
	gysiYSeriesInfo.ySeriesParamArray = new Array();
	
	/* If there are events to be flagged, the last two columns are events related columns. Else all the columns except the first are Y-series columns */
	numTotalYSeries = (flagEventCol == -1 ? (lineChartTable.rows[0].cells.length - 1) : (flagEventCol - 1));
	numYSeries = yLabels.length;
	
	/* Get Y-series values from the corresponding table */	
	for (var i = 0; i < numTotalYSeries; i++)
	{
		/* Start from 1 instead of 0 since the first row is title row */
		if(jQuery(jQuery(lineChartTable)[0].rows[0].cells[i+1]).text() == yLabels[ySerCnt])
		{
			ySeriesArray[ySerCnt] = new Array();
			for(var yValCnt = 1; yValCnt < lineChartTable.rows.length; yValCnt++)
			{
				/* cells[ySerCnt + 1] instead of cells[ySerCnt] below since the first column (index 0) is X-series */
				if(jQuery(jQuery(lineChartTable)[0].rows[yValCnt].cells[i + 1]).text() != "null")
				{
					ySeriesArray[ySerCnt][yValCnt - 1] = Number(jQuery(jQuery(lineChartTable)[0].rows[yValCnt].cells[i + 1]).text());
					//alert("Not NULL / " + ySeriesArray[ySerCnt][yValCnt - 1]);
				}
				else
				{
					ySeriesArray[ySerCnt][yValCnt - 1] = null;
				}
			}
			/* Store the minimum value from each Y-series array */
			minYSeriesValArray[ySerCnt] = Math.min.apply(Math, ySeriesArray[i]);
			
			//alert(ySeriesArray[ySerCnt]);
			
			ySerCnt++;
		}
	}
	
	/* Get the minimum value from the array of minimums created above */
	gysiYSeriesInfo.minAllYValues = Math.min.apply(Math, minYSeriesValArray);
	
	/* Create the Y-series configuration parameter array */
	if (combined == true)
	{
		for(var ySerCnt = 0; ySerCnt < numYSeries; ySerCnt++)
		{
			var lineType = 'spline';
			var valueSuffix = '';

			if(containsString(yLabels[ySerCnt], 'BLER'))
			{
				lineType = 'column';
				valueSuffix = ' %';
			}
			else if(containsString(yLabels[ySerCnt], 'Tput'))
			{
				valueSuffix = ' Mbps';
			}
			else if(containsString(yLabels[ySerCnt], 'RSRP'))
			{
				valueSuffix = ' dBm';
			}
			else if(containsString(yLabels[ySerCnt], 'RSRQ'))
			{
				valueSuffix = ' dB';
			}
			else if(containsString(yLabels[ySerCnt], 'TBS'))
			{
				lineType = 'spline';
				valueSuffix = ' bits';
			}
			else if(containsString(yLabels[ySerCnt], 'MCS'))
			{
				lineType = 'spline';
			}
			gysiYSeriesInfo.ySeriesParamArray[ySerCnt] = {
				name: yLabels[ySerCnt],
				type: lineType,
				color: seriesColors[ySerCnt],
				yAxis: ySerCnt,
				data: ySeriesArray[ySerCnt],
				tooltip: {
					valueSuffix: valueSuffix
				}
			};
		}
	}
	else
	{
		for(var ySerCnt = 0; ySerCnt < numYSeries; ySerCnt++)
		{
			gysiYSeriesInfo.ySeriesParamArray[ySerCnt] = {
				name: yLabels[ySerCnt],
				data: ySeriesArray[ySerCnt],
				id: 'ySeries' + ySerCnt
			};
		}
	}
	
	return gysiYSeriesInfo;
}

/* Add flags to the Y-Series array */
function getYSeriesWithFlags(lineChartTable, ySeriesArray, flagEventCol, flagSeries)
{
	/* Need to add flags only if there is an events column in the table */
	if(flagEventCol != -1)
	{
		var arrFlagsInfo = new Array();
		var cntr = 0;
		
		for(var yValCnt = 1; yValCnt < lineChartTable.rows.length; yValCnt++)
		{
			/* There is an event only if flagEventCol cell contains data */
			/* The reason why there are SO MANY EXPLICIT jQUERY calls below is BECAUSE OF IE!!! */
			if(jQuery.trim(jQuery(jQuery(lineChartTable)[0].rows[yValCnt].cells[flagEventCol]).text()) != '')
			{
				arrFlagsInfo[cntr] = 
				{
					x : (yValCnt - 1),
					title : jQuery(jQuery(lineChartTable)[0].rows[yValCnt].cells[flagEventCol]).text(),
					text : jQuery(jQuery(lineChartTable)[0].rows[yValCnt].cells[flagEventCol + 1]).text() /* 'flagEventCol + 1' => additional info */
				};
				cntr++;
			}
		}
		
		/* Last element of the Y-series array should be the flags */
		ySeriesArray[ySeriesArray.length] =
		{
			type : 'flags',
			data : arrFlagsInfo,
			onSeries: (flagSeries == null ? (ySeriesArray.length == 1 ? 'ySeries0' : 'onAxis') : flagseries),
			showInLegend: false
		};
	}
	
	return ySeriesArray;
}

/* Function to generate the band info array */
function getBandInfo(bandInfoParams)
{
	
	var bandInfoParamArray = new Array();
	var bandColorArray = ['rgba(68, 170, 213, 0.1)', 'rgba(0, 0, 0, 0)'];
	var textColorArray = ['#606060'];
	
	for(var cntr = 0; cntr < bandInfoParams.length; cntr++)
	{
		/* 'Number()' converts text to number data type */
		bandInfoParamArray[cntr] = {
			from: Number(bandInfoParams[cntr][0]),
			to: Number(bandInfoParams[cntr][1]),
			color: bandColorArray[cntr % 2], /* Alternate between light blue and white */
			label: {
				text: bandInfoParams[cntr][2],
				style: {
					color: '#606060'
				}
			}
		};
	}
	
	return bandInfoParamArray;
}

/*
**===================================================
** FILE OPERATION FUNCTIONS
**===================================================
*/
/* 
** Main function to create a file and give the user an option to save it
** @dataTable:	Table that contains the information required to generate the corresponding file
** @fileType:	Type of the file to be created
** @buttonID:	ID of the button that is used to create the file
*/

function createAndSaveFile(dataTableID, fileType, buttonID)   /* Just the name of the "Events_Table */
{
	var dataTable = document.getElementById(dataTableID); /* Get the whole Verison Information Table, FileID */
	if(dataTable)
	{
		/* Create an instance of the string variable to save the file content and also fileName variable  */
		var fileContent = "";
		var fileName = "";
		
		/* Handle different types of files */
		switch(fileType)
		{
			/* STT marker file */
			case "MarkerFile":
				fileContent = createMarkerFile(dataTable, buttonID); 
				fileName = "MarkerData.mkrx";
				break;
			default:
				alert("Invalid file type!");
				return;
		}
		
		if ((fileContent.indexOf("File Warning") != -1) || (fileContent.indexOf("File Error") != -1))
		{
			alert(fileContent);
		}
		else
		{
			/* Create the blob from the data and prompt the user to save the file */
			var blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
			saveAs(blob, fileName);
		}
	}
	else
	{
		alert("Error: Table required to generate the file does not exist!");
	}
}

/* Function to create the content of the STT marker file. Takes the source table as input argument */
/* format for 14:08 or greater STT version */
function createMarkerFile(tableToParse, fileID)
{  
	/* Create the marker file header string */
	var markerFileHeader = "<?xml version=\"1.0\" encoding=\"ASCII\"?>";
	markerFileHeader = markerFileHeader + "\n" + "<com.intel.imc.stt.emf:Markers xmi:version=\"2.0\" xmlns:xmi=\"http://www.omg.org/XMI\" xmlns:com.intel.imc.stt.emf=\"com.intel.imc.stt.emf\">"
	/* Create the marker file tail section */
	var markerFileTail = "</com.intel.imc.stt.emf:Markers>";

	var markerContent = createMarkersFromEventsTable(tableToParse, fileID);

	if (markerContent == "No Markers")
	{
		var markerFileContent = "File Warning: No events found in the log file to generate STT marker file!";
	}
	else
	{
		var markerFileContent = markerFileHeader + "\n" + markerContent + "\n" + markerFileTail;
	}
	
	return markerFileContent;
}

/* 
** TonyD added 03-04-2014
** Function to get File ID from Version Information table from Summary Report
** Tested with STT 14.06
** Left some statements and some other Regex expressions for debug, if needed.
** STT index must be delimited by [] and the message must end with hyphen -
*/
function createMarkersFromEventsTable(eventsInfoTable, fileInfoFileID)
{
	var numEventsTableRows = eventsInfoTable.getElementsByTagName("tr").length; /* get row from events info table */
  	var markerPrefix = " <markers index=\"";
	var completeMarkerContent = "";
	var fileHasEvents = false;
	var fileHasMarkers = false;
	var markerMessagePrefix = " <markerProperties name= \"0_" ;
	var markerMessageSuffix = "\"/>" ;
	var markerIndex;
	var firstSttIndexInstance = true;
	var firstMessageInstance = true;
	var messageIndex;
	var fileIDCol = 0; /* File ID column in Events_Info table */
	var addInfoCol = 1; /* Additional Info column in Events_Info table */
	var strEventInfo = "";
	var lastrow = false;

	/* Loop through Events_Table and match FileID in it with the file ID associated with the button */
	for (var eventRowCntr = 1; eventRowCntr < numEventsTableRows; eventRowCntr++)  /*FileId starts on 2nd row of Events table*/
	{
		if (jQuery(jQuery(eventsInfoTable)[0].rows[eventRowCntr].cells[fileIDCol]).text() == fileInfoFileID)
		{ 
			fileHasEvents = true;
			/* Concatenate additional info for this file from all the rows to create one string that will be parsed in "else" */
			strEventInfo = strEventInfo + "; " + jQuery(jQuery(eventsInfoTable)[0].rows[eventRowCntr].cells[addInfoCol]).text();
		}
	}
	
	/* We need the file for which the button is clicked, to have at least one event */
	if (fileHasEvents == true)  
	{
		/* pattern = regex to grap STt index and message delimted by hypen */
		var pattern = /\[\d{1,10}\](.+?)-/g;   // regex [123456] needed use escape [] by using \[ and \]
		// var pattern = /"\d{1,10}"(.+?)-/g;  // with "1234567" using quotes
		var masterStr = strEventInfo.match(pattern);
		if(masterStr != null)
		{
			/* Need pStr to convert this to a string again */
			var pStr = masterStr.toString(); /* this variable contains only what we need "12345"and the Message- */
			var RegxIndex = /\[\d{1,10}\]/g;
			// var RegxIndex = /[0-9]+/g;  /* Just the index */ 
			var RegxMessage = /[a-z|A-Z](.+?)-/g;  /* Just get the STT message only */
			var STTIndex	 = pStr.match(RegxIndex); 
			var STTMessage  = pStr.match(RegxMessage);
			
			/* Go through the array of STT Index values parsed above and create the corresponding marker entries */
			for (var sttIndexCntr = 0; sttIndexCntr < STTIndex.length; sttIndexCntr++)
			{
				var markerIndexSuffix = "\" marker=\"//@markerProperties." + (sttIndexCntr) + "\"/>";
				if(firstSttIndexInstance == true)
				{
					STTIndex[sttIndexCntr] = STTIndex[sttIndexCntr].substring(1, STTIndex[sttIndexCntr].indexOf(']')); /* Remove the brackets from around STT Index value */
					markerIndex = markerPrefix + STTIndex[sttIndexCntr] + markerIndexSuffix;
					firstSttIndexInstance = false;
				}
				else
				{
					STTIndex[sttIndexCntr] = STTIndex[sttIndexCntr].substring(1, STTIndex[sttIndexCntr].indexOf(']')); /* Remove the brackets from around STT Index value */
					markerIndex = markerIndex + "\n" + markerPrefix + STTIndex[sttIndexCntr] + markerIndexSuffix;
				}
			} /* for (var sttIndexCntr = 0; sttIndexCntr < STTIndex.length; sttIndexCntr++) */

			/* Go through the array of Messages parsed above and create the corresponding message entries */
			for (var messageCntr = 0; messageCntr < STTMessage.length; messageCntr++)
			{
				if(firstMessageInstance == true)
				{
					STTMessage[messageCntr] = STTMessage[messageCntr].substring(0, STTMessage[messageCntr].indexOf('-'));
					messageIndex = markerMessagePrefix + STTMessage[messageCntr] + markerMessageSuffix; 
					firstMessageInstance = false;
				}
				else
				{
					STTMessage[messageCntr] = STTMessage[messageCntr].substring(0, STTMessage[messageCntr].indexOf('-'));
					messageIndex = messageIndex + "\n" + markerMessagePrefix + STTMessage[messageCntr] + markerMessageSuffix;
				}
			} /* for (var messageCntr = 0; messageCntr < STTMessage.length; messageCntr++) */
			
			fileHasMarkers = true;

		} /* if(masterStr != null) */

		/* Combine the STT Index entries and message entries to create the complete marker content (this is the "meat" of the file) */
		completeMarkerContent = markerIndex + "\n" + messageIndex;

	} /*end if */

	if (fileHasMarkers == false)
	{
		completeMarkerContent = "No Markers";
	}
	
	return(completeMarkerContent); /*Return the marker contents */
} /*End function getfileid */


/*
**===================================================
** MAPPING FUNCTIONS
**===================================================
*/
/*======================= GOOGLE MAPS =======================*/
/* 
** Main function to generate the Google map widget
** @mapDivID: "DIV" in which to draw the map
** @mapTableID: Table from which the map data is extracted
** @mapParams: Map parameters object (titles, thresholds etc.)
** @buttonID: Button that needs to be disabled after a graph is plotted
*/

var arrGlobaMarkerList = new Array()
var gMarkerCnt = 0;

function drawMap(mapDivID, mapParams, buttonID)
{
	//console.log("entering drawMap");
	var gpsAvailable = false;
	var eventAvailable = false;

	if(mapParams.showGps) {
        if(mapParams.gpsData.length>0)
        {
            gpsAvailable = true;
        }
	}

    if(mapParams.eventData.length>0)
    {
        eventAvailable = true;
    }

	/* If none of the tables is available, throw error and exit */
	if(!gpsAvailable & !eventAvailable)
	{
		alert("No data available to generate the map!");
		return;
	}

	/* Define basic map options 
	** Center Lat = latitude (col 1) from the first non-title row of the table (rows[1].cells[0])
	** Center Long = longitude (col 2) from the first non-title row of the table (rows[1].cells[1])
	** Get this info from the complete GPS data table if it is enabled and available, else get it only
	** from the radio conditions / events table
	*/
	if(gpsAvailable || eventAvailable)
	{
		var centerLong = mapParams.centerPoint[0];
		var centerLat = mapParams.centerPoint[1];
	}
	else
	{
		alert("Something went wrong. We should not be here!");
		var centerLat = 0;
		var centerLong = 0;
	}

	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(centerLat, centerLong),
		streetViewControl: true,
		mapTypeId: 'roadmap',
        mapTypeControl: true
	  };
	
	var map = new google.maps.Map(document.getElementById(mapDivID), mapOptions);
	
	/* Call the function that adds markers to the map created above */
	if(gpsAvailable)
	{
		drawMapMarkers(map, mapParams.gpsData);
	}

	if(eventAvailable)
	{
		drawMapMarkers(map, mapParams.eventData);
	}

}

/* Function to add markers to the map */
function drawMapMarkers(map, data)
{
	//console.log("entering drawMapMarkers");
	var numDataPoints = data.length;
	var numInfoCols = data[0].length;
	var addInfoWindow = new Array();

	/* Row #1 -> column labels, Row #2 -> Center Lat / Long */
	for(var i = 1; i < numDataPoints; i++)
	{
		var latitude = data[i][0];
		var longitude = data[i][1];

		/* Column with marker image info: last column (cells[last col - 1]) */
		var markerImage = data[i][numInfoCols - 1];
		
		/* Generate the "info" string from the relevant columns.
		** 0 & 1 -> Lat & Long
		** 2 to (max - 1) -> all other columns except max (marker image info)		
		*/
		var info = '<DIV style="width:300px; height:250px;" class="info_window">';
		for( var j = 2; j < (numInfoCols - 1); j++)
		{
			var colTitle = data[0][j];
			var colData = data[i][j];
			info = info + ((jQuery.trim(colData) != "" || jQuery.trim(colData) != "undefined" || jQuery.trim(colData) != 0.0) ? ('<b>' + colTitle + ':</b> ' + colData + '<br>') : '');
			
		}
		info = 	info + '</DIV>';

        //draw gps or event marker
        markerImage = 'https://ifits.github.io/ifits-map/images/' + markerImage;
        //console.log("markerImage="+markerImage);
        addInfoWindow[gMarkerCnt] = new google.maps.InfoWindow({content: info});
        arrGlobaMarkerList[gMarkerCnt] = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: map,
            icon: markerImage
        });
        google.maps.event.addListener(arrGlobaMarkerList[gMarkerCnt], 'click', makeInfoWindowEvent(map, addInfoWindow[gMarkerCnt], arrGlobaMarkerList[gMarkerCnt]));
        gMarkerCnt++;

	}
}

/* Function to add event window to the markers 
** A separate function is created for this because writing an in-line function within the for loop does not work due to "closures"
** Please refer to: https://developers.google.com/maps/documentation/javascript/examples/event-closure
*/
var prevInfoWindow;
function makeInfoWindowEvent(map, currentInfoWindow, infoWindowMarker)
{  
	return function()
	{
		/* If a window was open before, close it */
		if(prevInfoWindow != null)
		{
			prevInfoWindow.close();
		}
		
		currentInfoWindow.open(map, infoWindowMarker);

		/* Save the current open window to be closed when another window is opened at a later time */
		prevInfoWindow = currentInfoWindow;
	};  
	
}

/* Function to toggle LTE markers visibility */
function toggleMarkers(mapParams, markerToToggle)
{
	//console.log("markerToToggle="+markerToToggle);
	//console.log("arrGlobaMarkerList="+arrGlobaMarkerList);
	for(var count = 0; count < arrGlobaMarkerList.length; count++)
	{
		if(containsString(arrGlobaMarkerList[count].icon, markerToToggle))
		{
			if(arrGlobaMarkerList[count].getVisible() == true)
			{
				arrGlobaMarkerList[count].setVisible(false);
			}
			else
			{
				arrGlobaMarkerList[count].setVisible(true);
			}
		}
	}
}