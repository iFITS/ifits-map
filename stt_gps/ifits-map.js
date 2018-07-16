var ScriptVersion="2015-08-05"

importPackage(com.infineon.stt.service.interfaces.script);
importPackage(java.lang);
importPackage(java.util);
importPackage(java.math);
importPackage(java.util.regex);
importPackage(java.text);
importPackage(java.io);

importPackage(javax.swing);


var requiredFields = new Array();
requiredFields[0] = "_Full Decode";
requiredFields[1] = "LOG_TYPE";
requiredFields[2] = "Message Type";
requiredFields[3] = "_MT";
requiredFields[4] = "_Decoder Message";
requiredFields[5] = "_Summary";
requiredFields[6] = "EXTRA_INFO";
requiredFields[7] = "LTE PS Info";


var UMTS_Fields = new Array();
UMTS_Fields[0] = "_TS3";
UMTS_Fields[1] = "UMTS FN";

var old_l1rSibReadRequest_string="";

var t_rrc_reconf_ho="";
var globalIndex = "";
var first_decoding_MPH_IRAT_MEAS_IND = true;

var MsgPS         = "_Summary" ;
var PanelPS       = "_Full Decode" ;
var MsgFW         = "_Summary" ;
var PanelFW       = "_Full Decode" ;
var MsgLG         = "_Summary" ;
var PanelLG       = "_Full Decode" ;
var Msg3G         = "_Summary" ;
var Panel3G       = "_Full Decode" ;

var TYPE_SEP      = ", ";
var TYPE_SEP2     = "; ";
var VALUE_SEP     = ": ";
var EQUALS        = "=";
var MINUS         = "-";
var DECI          = "(Deci)";
var WRONG_MSG_LEN = "wrong message length";
var UNKNOWN_TYPE  = "unknown type";

var operator_code = new Array();
var operator_name = new Array();

var stringVector = new Vector();

var RSCP_OFFSET             = 116;
var RSSI_OFFSET             = 111;
var MAX_BEST_CELLS          = 10;

/*TDAS module FILE_ID*/
var OSA_OSA_FILE_ID_BASE    =    11000;
var OSA_PDH_FILE_ID_BASE    =    12000;
var OSA_PPP_FILE_ID_BASE    =    13000;
var OSA_RLC_FILE_ID_BASE    =    14000;
var OSA_RLP_FILE_ID_BASE    =    15000;
var OSA_RRC_FILE_ID_BASE    =    16000;
var OSA_SM_FILE_ID_BASE     =    17000;
var  RRC_BCFE_FILE_ID_BASE   =   OSA_RRC_FILE_ID_BASE;
/*
RRC_DCFE_FILE_ID_BASE == 16100
*/
var  RRC_DCFE_FILE_ID_BASE   =   (OSA_RRC_FILE_ID_BASE + 100)
/*
RRC_GCFE_FILE_ID_BASE == 16200
*/
var  RRC_GCFE_FILE_ID_BASE   =   (OSA_RRC_FILE_ID_BASE + 200)
/*
RRC_MCFE_FILE_ID_BASE == 16300
*/
var  RRC_MCFE_FILE_ID_BASE   =   (OSA_RRC_FILE_ID_BASE + 300)
/*
RRC_TC_FILE_ID_BASE == 16400
*/
var  RRC_TC_FILE_ID_BASE     =   (OSA_RRC_FILE_ID_BASE + 400)
/*
RRC_DIAG_FILE_ID_BASE == 16500
*/
var  RRC_DIAG_FILE_ID_BASE   =   (OSA_RRC_FILE_ID_BASE + 500)
/*
RRC_COMMON_FILE_ID_BASE == 16600
*/
var  RRC_COMMON_FILE_ID_BASE  =  (OSA_RRC_FILE_ID_BASE + 600)
/*
RRC_MBMS_FILE_ID_BASE == 16700
*/
var RRC_MBMS_FILE_ID_BASE   =    (OSA_RRC_FILE_ID_BASE + 700)

/* ASM ADAPTATION :: constants defined */
var RAT_GSM  = 1;
var RAT_UMTS = 2;
var RAT_LTE  = 3;
var RAT_NOT_AVAILABLE = -1;

//////////////////////////////////////////////////
function start()
{
	logMessage( "ScriptVersion=" + ScriptVersion );
	logMessage( "Java Version [" + GetJavaScriptVersion() + "]" );
	var isHeadless = script.isHeadless();
	logMessage( "Script is headless? " + isHeadless);
	var sttVersion = script.getSttVersion();
	logMessage("STT Version: " + sttVersion);
	var size = script.getMaxIndex();
	logMessage("MaxIndex=" + size);

	if (isHeadless)
	{
		ui.addField("Frame/SubF", ISttScriptService.FieldType.UTF8, "updateColumnFrameSFrame", requiredFields);
		ui.addField("Umts SFN", ISttScriptService.FieldType.UTF8, "UmtsSFN", UMTS_Fields );
		ui.addField("Umts CFN", ISttScriptService.FieldType.UTF8, "UmtsCFN", UMTS_Fields );
		ui.addField("Extra Info by Script", ISttScriptService.FieldType.UTF8, "updateColumn", requiredFields);
	}
	else
	{
		ui.addField("Frame/SubF", ISttScriptService.FieldType.UTF8, "updateColumnFrameSFrame", requiredFields);
		ui.addField("Umts SFN", ISttScriptService.FieldType.UTF8, "UmtsSFN", UMTS_Fields );
		ui.addField("Umts CFN", ISttScriptService.FieldType.UTF8, "UmtsCFN", UMTS_Fields );
		ui.addColumn("Extra Info by Script", ISttScriptService.FieldType.UTF8, "updateColumn", requiredFields);
	}
}

//////////////////////////////////////////////////
function stop()
{
	if (script.isHeadless())
	{
		script.removeField("Frame/SubF");
		script.removeField("Umts SFN");
		script.removeField("Umts CFN");
		script.removeField("Extra Info by Script");
	}
	else
	{
		script.removeField("Frame/SubF");
		script.removeColumn("Frame/SubF");
		script.removeField("Umts SFN");
		script.removeColumn("Umts SFN");
		script.removeField("Umts CFN");
		script.removeColumn("Umts CFN");
		script.removeColumn("Extra Info by Script");
	}
}

//////////////////////////////////////////////////
function UmtsSFN( msg )
{
	globalIndex = msg.getMsgIndex();
	try {
		var hm = msg.getFieldsValueMap( );
		var Ts3Value = hm.get( "_TS3" );

		if (IsEmpty(Ts3Value))
		{
			Ts3Value = hm.get( "UMTS FN" );
			if (IsEmpty(Ts3Value))
			{
				return( "" );
			}
		}
		return( (Ts3Value & 0x0FFF));
	} catch (e) {
		logException(e);
	}
	return "";
}

//////////////////////////////////////////////////
function UmtsCFN( msg )
{
	globalIndex = msg.getMsgIndex();
	try {
		var hm = msg.getFieldsValueMap( );
		var Ts3Value = hm.get( "_TS3" );

		if (IsEmpty(Ts3Value))
		{
			Ts3Value = hm.get( "UMTS FN" );
			if (IsEmpty(Ts3Value))
			{
				return( "" );
			}
		}
		return( (Ts3Value & 0x0FF));
	} catch (e) {
		logException(e);
	}
	return "";
}

//////////////////////////////////////////////////
/**
	The function computes the Frame/SFrame, which is displayed in an extra column.
	The function is a generic function. It searches the Frame/SFrame under a standard patern.

	@param msg The message to process
	@return The Frame/SFrame or empty if not found.
*/
function updateColumnFrameSFrame( msg )
{
	globalIndex = msg.getMsgIndex();
	if (msg.getMid() == 0)
	{
		var PayloadName = getPayloadName( msg );
		if (PayloadName != "")
		{
			var Frame_str = service.getDecodedStructValue(PanelPS, msg, PayloadName, "header.time.frame");
			var SFrame_str = service.getDecodedStructValue(PanelPS, msg, PayloadName, "header.time.subFrame");
			if (!IsEmpty(Frame_str) && Frame_str != "0" && !IsEmpty(SFrame_str))
				return Frame_str + "/" + SFrame_str;

			var Frame_str = service.getDecodedStructValue(PanelPS, msg, PayloadName, "frame");
			var SFrame_str = service.getDecodedStructValue(PanelPS, msg, PayloadName, "subFrame");
			if (!IsEmpty(Frame_str) && Frame_str != "0" && !IsEmpty(SFrame_str))
				return Frame_str + "/" + SFrame_str;
		}
	}

	return "";
}

//////////////////////////////////////////////////
/**
	The function is used to extract out of the "_Full Decode", the name of the payload.
	@param msg The message for which the payload must be extracted.
	@return The name of the payload, or empty if the payload is not found.
*/
function getPayloadName( msg )
{
	var Line_FullDecode = new String( msg.getValue("_Full Decode") );
	var posStartOfName = Line_FullDecode.indexOf( "<struct><name>" );
	if (posStartOfName != -1)
	{
		var posEndOfName = Line_FullDecode.indexOf( "</name>", posStartOfName);
		if (posEndOfName != -1)
		{
			var PayloadName = Line_FullDecode.substr( posStartOfName+14, posEndOfName-(posStartOfName+14) );
			return( PayloadName );
		}
		else
		{
			logMessage( "Does not contain </name>" + Line_FullDecode);
		}
	}
	else if (IsEmpty(Line_FullDecode) || (posStartOfName = Line_FullDecode.indexOf( "<structdef><bytearray>" )) != -1)
	{	// This is normal. We return an empty PayLaod
	}
	else
	{
		var CurMsg = msg.getUTF8StringValue("_Summary");
		if (!strStartsWith( CurMsg, "Uta") && !strStartsWith( CurMsg, "Default decode"))
		{
			logMessage( "Does not start <structdef><struct><name> Line_FullDecode=[" + Line_FullDecode + "] CurMsg="+CurMsg+"] Line_FullDecode=["+Line_FullDecode+"]" );
		}
	}

	return( "" );
}


//////////////////////////////////////////////////
function updateColumn__DefaultMsg( msg )
{
//	var hm = msg.getFieldsValueMap( );
//	return "Msg Not Found. Cid=" + msg.getCid() + " Mid=" + msg.getMid() + " Index=" + msg.getMsgIndex() + " Msg=$" + hm.get( "_Summary" ) +"$";
	return "";
}

//////////////////////////////////////////////////
function return_message_length_do_not_fit( len )
{
	script.log( "Not fit : " + len );
	return( "" );
}

//////////////////////////////////////////////////
function strStartsWith(str, prefix)
{
	try {
		return str.indexOf(prefix) == 0;
	} catch (e) {
		logException(e);
	}
}

//////////////////////////////////////////////////
function logMessage(str)
{
	script.log( "Index=" + globalIndex + " " + str );
}

//////////////////////////////////////////////////
function logException( e )
{
	script.log( "Exception=" + e.name + " Line=" + e.lineNumber + " Msg=" + e.message );
}


function convert_RntiTypeNum_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "UNDEF_RNTI" );
		case 1: return ( "C_RNTI" );
		case 2: return ( "TEMP_C_RNTI" );
		case 4: return ( "SI_RNTI" );
		case 8: return ( "P_RNTI" );
		case 16: return ( "RA_RNTI" );
		case 32: return ( "SPS_C_RNTI" );
		case 64: return ( "TPC_PUCCH_RNTI" );
		case 128: return ( "TPC_PUSCH_RNTI" );
	}
	return( str + "Not found" );
}

function convert_IRAT_Mode_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return( "SLAVE" );
		case 1: return( "MASTER" );
	}
	return( str + "Not found" );
}

function convert_ack_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "NACK" );
		case 1: return ( "ACK" );
		case 2: return ( "DTX" );
	}
	return( str + "Not found" );
}


function convert_phich_duration_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "Normal" );
		case 1: return ( "Extendend" );
		case 255: return ( "Unknown" );
	}
	return( str + "Not found" );
}


function convert_phich_resources_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "OneSixth" );
		case 1: return ( "Half" );
		case 2: return ( "One" );
		case 3: return ( "Two" );
		case 255: return ( "Unknown" );
	}
	return( str + "Not found" );
}

function convert_harq_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "ACK" );
		case 1: return ( "NACK" );
		case 2: return ( "NONE" );
	}
	return( str + "Not found" );
}

function convert_harqvalue_to_str( str )
{
	if (str == "HARQ_STATUS_NAK")		return( "NACK" );
	if (str == "HARQ_STATUS_ACK")		return( "ACK" );
	if (str == "HARQ_STATUS_NONE")		return( "NONE" );
	return( str );
}

function convert_TrueFalse_to_str( str )
{
	if (str == "0") return "False";
	return "True" ;
}

function convert_OnOff_to_str( str )
{
	if (parseInt(str)) return "ON";
	return "OFF" ;
}

function convert_RSRP_to_str( str )
{
	var rsrp_cell_float = parseFloat(str);
	var rsrp_cell_dB_float = (rsrp_cell_float - 281) / 2;
	return( rsrp_cell_dB_float.toString() );
}

function convert_RSRPNas_to_str( str )		// For Nas message: 3GPP 36.133 9.1.4 RSRP Measurement Report Mapping
{
	var rsrp_cell_float = parseFloat(str);
	var rsrp_cell_dB_float = (rsrp_cell_float) - 141;
	return( rsrp_cell_dB_float.toString() );
}

function convert_RSRQ_to_str( str )
{
	var rsrq_cell_float = parseFloat(str);
	var rsrq_cell_dB_float = 0.124*rsrq_cell_float - 24.8;
	var rsrq_cell_dB_float_rounded=Math.round(rsrq_cell_dB_float*100)/100;
	return( rsrq_cell_dB_float_rounded.toString() );
}

function convert_RSRQNas_to_str( str )		// For Nas message: 3GPP 36.133 9.1.7 RSRQ Measurement Report Mapping
{
	var rsrq_cell_float = parseFloat(str);
	var rsrq_cell_dB_float = (rsrq_cell_float/2) - 19.5;
	var rsrq_cell_dB_float_rounded=Math.round(rsrq_cell_dB_float*10)/10;
	return( rsrq_cell_dB_float_rounded.toString() );
}

function convert_100th_to_str( str )		// Convert Value expressed in 100th of the unit
{
	var value_float = parseFloat(str);
	var value_float = value_float / 100;
	return( value_float.toString() );
}

function convert_SetupRelease_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "RELEASE" );
		case 1: return ( "SETUP" );
		case 255: return ( "DISABLE" );
	}
	return( str + "Not found" );
}

function convert_FormatInd_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "WIDEBAND" );
		case 1: return ( "SUBBAND" );
	}
	return( str + "Not found" );
}

function convert_DuplexMode_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "FDD" );
		case 1: return ( "TDD" );
	}
	return( str + "Not found" );
}

function convert_BandWidth_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "N6" );
		case 1: return ( "N15" );
		case 2: return ( "N25" );
		case 3: return ( "N50" );
		case 4: return ( "N75" );
		case 5: return ( "N100" );
		case 255: return ( "UNKNOWN" );
	}
	return( str + "Not found" );
}



function convert_bwcRaType_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "ContentionBased L1" );
		case 1: return ( "ContentionBased MAC" );
		case 2: return ( "ContentionFree");
	}
	return( str + "Not found" );
}

function convert_BandWidth_index_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "1.4MHz" );
		case 1: return ( "3MHz" );
		case 2: return ( "5MHz" );
		case 3: return ( "10MHz" );
		case 4: return ( "15MHz" );
		case 5: return ( "20MHz" );
		case 255: return ( "UNKNOWN" );
	}
	return( str + "Not found" );
}

function convert_CsRsrpCommand_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "ABORT_PROC" );
		case 1: return ( "PAUSE_PROC" );
		case 2: return ( "CONT_PROC" );
		case 3: return ( "START_PROC" );
		case 4: return ( "END_PROC" );
	}
	return( str + "Not found" );
}

function convert_CsRsrpMode_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "CELL_SEARCH" );
		case 1: return ( "RSRP_MEAS" );
	}
	return( str + "Not found" );
}

function convert_DataType_to_str( str )
{
	if (str == "TRAFFIC_TYPE_DATA") return( "D" );
	if (str == "TRAFFIC_TYPE_CONTROL") return( "C" );
	return( "");
}

function convert_PduType_to_str( str )
{
	if (str == "TRAFFIC_TYPE_CONTROL") return( "CTRL" );
	if (str == "POLLING_FLAG_STATUS_REQUESTED") return( "REQ" );
	return( "");
}

function convert_RBType_to_str( str )
{
	if (str == "RB_TYPE_SIGNALLING") return( "SIGN" );
	if (str == "RB_TYPE_DATA") return( "DATA" );
	return( "");
}

function convert_phichParame_to_str( str )
{
	if (str == "PHICH_Configphich_Duration_normal") return( "Normal" );
	if (str == "PHICH_Configphich_Duration_extended") return( "Extended" );
	if (str == "PHICH_Configphich_Resource_one") return( "One" );
	if (str == "PHICH_Configphich_Resource_two") return( "Two" );
	if (str == "PHICH_Configphich_Resource_half") return( "Half" );
	if (str == "PHICH_Configphich_Resource_oneSixth") return( "OneSixth" );
	return( "");
}

function convert_StatusReq_to_str( str )
{
	if (str == "POLLING_FLAG_STATUS_NOT_REQUESTED") return( "N_REQ" );
	if (str == "POLLING_FLAG_STATUS_REQUESTED") return( "REQ" );
	return( "");
}

function convert_LastSegmentFlag_to_str( str )
{
	if (str == "LAST_SEGMENT_FLAG_NOT_LAST_BYTE") return( "N_LAST" );
	if (str == "LAST_SEGMENT_FLAG_LAST_BYTE") return( "LAST" );
	return( "");
}

function convert_RxAnt_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "RXAN1" );
		case 1: return ( "RXAN2" );
	}
	return( str + "Not found" );
}

function convert_ServingType_to_str( str )
{
	if (str=="RLC_TX_SERVING_TYPE_CONTROL_PDU")	return( "Ctrl PDU" );
	if (str=="RLC_TX_SERVING_TYPE_NEW_PDU")	return( "New PDU" );
	if (str=="RLC_TX_SERVING_TYPE_RETRANSMISSION_PDU")	return( "ReTr PDU" );
	return( str );
}

function convert_ServiceType_to_str( str )
{
	if (str=="E_AS_SERVICE_MODE_NORMAL")	return( "MODE_NORMAL" );
	if (str=="E_AS_SERVICE_MODE_LIMITED")	return( "MODE_LIMITED" );
	if (str=="E_AS_SERVICE_MODE_EMERGENCY")	return( "MODE_EMERGENCY" );
	if (str=="T_AS_SERVICE_MODE_FORCE_INT")	return( "FORCE_INT" );
	return( str );
}

function convert_ActivateOption_to_str( str )
{
	if (str=="ACTIVATION_OPTION_ACTIVATE")	return( "Activate" );
	if (str=="ACTIVATION_OPTION_DEACTIVATE")	return( "Deactivate" );
	if (str=="ACQUISITION_OPTION_START")	return( "Start" );
	return( str );
}

function convert_BandWidthLitteral_to_str( str )
{
	if (str=="MasterInformationBlockdl_Bandwidth_n6")	return( "1.4MHz" );
	if (str=="MasterInformationBlockdl_Bandwidth_n15")	return( "3MHz" );
	if (str=="MasterInformationBlockdl_Bandwidth_n25")	return( "5MHz" );
	if (str=="MasterInformationBlockdl_Bandwidth_n50")	return( "10MHz" );
	if (str=="MasterInformationBlockdl_Bandwidth_n75")	return( "15MHz" );
	if (str=="MasterInformationBlockdl_Bandwidth_n100")	return( "20MHz" );
	return( str );
}

function convert_BandWidthNum_to_str( str )
{
	switch (parseInt(str)) {
		case 6: return ( "1.4MHz" );
		case 15: return ( "3MHz" );
		case 25: return ( "5MHz" );
		case 50: return ( "10MHz" );
		case 75: return ( "15MHz" );
		case 100: return ( "20MHz" );
	}
	return( str + "Not found" );
}

function convert_RntiTypeLitteral_to_str( str )
{
	if(str=="RNTI_TYPE_SI_RNTI")		return( "SI RNTI" );
	if(str=="RNTI_TYPE_RA_RNTI")		return( "RA RNTI" );
	if(str=="RNTI_TYPE_C_RNTI")			return( "C RNTI" );
	if(str=="RNTI_TYPE_TEMP_C_RNTI")	return( "TEMP C RNTI" );
	if(str=="RNTI_TYPE_SPS_C_RNTI")		return( "SPS C RNTI" );
	if(str=="RNTI_TYPE_TPC_PUCCH_RNTI")	return( "PUCCH RNTI" );
	if(str=="RNTI_TYPE_TPC_PUSCH_RNTI")	return( "PUSCH RNTI" );
	return( str + "Not found" );
}

function convert_RAR_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "OK" );
		case 1: return ( "RAR_WINDOW_EXPIRED" );
		case 2: return ( "RAPID_NOT_FOUND" );
	}
	return( str + "Not found" );
}

function convert_bwcCscRsrpMode_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "REAL_TIME" );
		case 1: return ( "OFF_LINE" );
		case 2: return ( "LARGE_CELL" );
	}
	return( str + "Not found" );
}

function convert_bwcEnable_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "DISABLE" );
		case 1: return ( "ENABLE" );
	}
	return( str + "Not found" );
}

function convert_bwcSpsClear_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "NONE" );
		case 1: return ( "UL" );
		case 2: return ( "DL" );
		case 3: return ( "UL_AND_DL" );
	}
	return( str + "Not found" );
}

function convert_bwcHarqReset_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "NONE" );
		case 1: return ( "UL" );
		case 2: return ( "DL" );
		case 3: return ( "UL_AND_DL" );
	}
	return( str + "Not found" );
}

function isInteger( str )
{
	var i;

	for (i = 0; i < str.length(); i++){
		// Check that current character is number.
		var c = str.charAt(i);
		if (((c < 48) || (c > 57)))
			{
			return false;
			}
		// uncomment the next line of code if you want to detect leading zeros.
		//if (i==1 && c=="0") return false;
		}
	// All characters are numbers.
	return true;
}

function convert_bwcCsRsrpCommand_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "ABORT_PROC" );
		case 1: return ( "PAUSE_PROC" );
		case 2: return ( "CONT_PROC" );
		case 3: return ( "START_PROC" );
		case 4: return ( "END_PROC" );
	}
	return( str + "Not found" );
}

function convert_bwcCsRsrpMode_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "CELL_SEARCH" );
		case 1: return ( "RSRP_MEAS" );
		case 2: return ( "FREQ_SCAN" );
	}
	return( str + "Not found" );
}

function convert_Timer_to_str( str )
{
	if(str=="LT_TIMER_STARTED")		return( "Started" );
	if(str=="LT_TIMER_STOPPED")		return( "Stopped" );
	if(str=="LT_TIMER_EXPIRED")		return( "Expired" );
	return( str );
}

function convert_Sync_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "NO_SYNC" );
		case 1: return ( "SYNC" );
		case 2: return ( "NO_SYNC_N310" );
		case 3: return ( "SYNC_N311" );
	}
	return( str + "Not found" );
}

function convert_PSMode_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "ACTIVE" );
		case 1: return ( "LIGHT_SLEEP" );
		case 2: return ( "DEEP_SLEEP" );
		case 3: return ( "OFF" );
	}
	return( str + "Not found" );
}

function convert_PSReason_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "PAGING_CYCLE_DRX" );
		case 1: return ( "ONDURATION_EXPIRED" );
		case 2: return ( "DRX_AND_DTX" );
		case 3: return ( "DRX_INACTIVITY_TIMER_EXPIRED" );
		case 4: return ( "MAC_DRX_CE" );
		case 5: return ( "POWER_OFF" );
	}
	return( str + "Not found" );
}

function convert_SIRestType_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "Startup" );
		case 1: return ( "Recovery" );
		case 2: return ( "Refresh" );
		case 3: return ( "BPDisconnect" );
		case 4: return ( "Disconnect" );
		case 5: return ( "PresenceDetection" );
		case 6: return ( "TypeSwitch" );
		case 7: return ( "SIMRemoved" );
		case 8: return ( "NotActivated" );
	}
	return( str + "Not found" );
}

function convert_SIMIndicator_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "NotSet" );
		case 1: return ( "Reactivating" );
		case 2: return ( "NOT_Present" );
		case 3: return ( "Present" );
		case 4: return ( "Reactivated" );
		case 5: return ( "ERROR" );
		case 6: return ( "Blocked" );
	}
	return( str + "Not found" );
}

function convert_UICCAPCard_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "2G" );
		case 1: return ( "3G" );
	}
	return( str + "Not found" );
}

function convert_UICCAPCardSelector_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "Primary" );
		case 1: return ( "Secondary1" );
		case 2: return ( "Secondary2" );
	}
	return( str + "Not found" );
}

function convert_UICCResetResult_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "ActivationSucceeded" );
		case 1: return ( "ActivationFAILED" );
		case 2: return ( "RejectCard" );
	}
	return( str + "Not found" );
}

function convert_MMCStatus_to_str( str )	// T_MMC_STATUS
{
	switch (parseInt(str)) {
		case 0: return ( "StatusNone" );
		case 1: return ( "RegStarted" );
		case 2: return ( "RegComplete" );
		case 3: return ( "RegNotNeeded" );
		case 4: return ( "CA_CallInitiated" );
		case 5: return ( "ActNeeded" );
	}
	return( str + "Not found" );
}

function convert_MMCause_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "NoCause" );
		case 1: return ( "AttachNeeded" );
		case 2: return ( "RU_Needed" );
		case 3: return ( "LU_Needed" );
		case 4: return ( "PeriodicUpdNeeded" );
		case 5: return ( "NoUpdate" );
		case 6: return ( "Successful" );
		case 7: return ( "AuthFailure" );
		case 8: return ( "InvalidSIM" );
		case 9: return ( "RU_Rejected" );
		case 10: return ( "LU_Rejected" );
		case 11: return ( "NotAttached" );
		case 12: return ( "ArrachRejected" );
		case 13: return ( "AttCont" );
		case 14: return ( "RU_COnt" );
		case 15: return ( "DET_Cont" );
		case 16: return ( "TimerActive" );
		case 17: return ( "CS_COnnAborte" );
		case 18: return ( "AccessBarred" );
		case 19: return ( "TAU_Needed" );
		case 20: return ( "TAU_Cont" );
		case 21: return ( "DetachNeeded" );
		case 22: return ( "EmeregAttachNeeded" );
	}
	return( str + "Not found" );
}

function convert_RAT_to_str( str )	// T_RAT
{
	switch (parseInt(str)) {
		case 0: return ( "NotAvailable" );
		case 1: return ( "GSM" );
		case 2: return ( "UMTS" );
		case 3: return ( "LTE" );
	}
	if (str.substr(0,4) == "RAT_")
		return( str );

	return( str + "Not found" );
}

function convert_IRCapability_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "ReqFromRR" );
		case 1: return ( "ReqFromURRC" );
		case 2: return ( "ReqFromERRC" );
		case 3: return ( "ReqFromGMM" );
		case 3: return ( "ReqFromEMM" );
	}
	return( str + "Not found" );
}

function convert_IR_ASM_RESEL_REQ_MSG_TYPES_to_str( str )	// T_IR_ASM_RESEL_REQ_MSG_TYPES
{
	var  key = "";
	var patternStr = new RegExp("T_MSGTYPE_\(.*\)_RESEL_REQ");
	var matcher = patternStr.exec(str);
	if (void 0 != matcher)
	{
		key = matcher[1];
	}

	switch (key)
	{
		case "URRC_RR":   return( "3G --> 2G reselection" );		// T_MSGTYPE_URRC_RR_RESEL_REQ{0}
		case "URRC_ERRC": return( "3G --> LTE reselection" );		// T_MSGTYPE_URRC_ERRC_RESEL_REQ{1}
		case "URRC_SRRC": return( "3G --> SAT reselection" );		// T_MSGTYPE_URRC_SRRC_RESEL_REQ{2}
		case "RR_URRC":   return( "2G --> 3G reselection" );		// T_MSGTYPE_RR_URRC_RESEL_REQ{3}
		case "RR_ERRC":   return( "2G --> LTE reselection" );		// T_MSGTYPE_RR_ERRC_RESEL_REQ{4}
		case "RR_SRRC":   return( "2G --> SAT reselection" );		// T_MSGTYPE_RR_SRRC_RESEL_REQ{5}
		case "ERRC_URRC": return( "LTE --> 3G reselection" );		// T_MSGTYPE_ERRC_URRC_RESEL_REQ{6}
		case "ERRC_RR":   return( "LTE --> 2G reselection" );		// T_MSGTYPE_ERRC_RR_RESEL_REQ{7}
		case "SRRC_URRC": return( "SAT --> 3G reselection" );		// T_MSGTYPE_SRRC_URRC_RESEL_REQ{8}
		case "SRRC_RR":   return( "SAT --> 2G reselection" );		// T_MSGTYPE_SRRC_RR_RESEL_REQ{9}
	}
	return( str + "Not found" );
}

function convert_URRC_INFO_TYPE_to_str( str )	// T_URRC_INFO_TYPE
{
	switch (parseInt(str)) {
		case 0: return ( "CBS_AVAIL" );
		case 1: return ( "HSPA_AVAIL_IN_CELL" );
		case 2: return ( "HSPA_CONNECTION_STATUS" );
		case 3: return ( "URRC_STATE" );
		case 4: return ( "FREEZONE_ACTIVE" );
		case 5: return ( "EUTRA_DETECTED" );
		case 6: return ( "SIG_CONN_STATUS" );
		case 7: return ( "CELL_ID_AVAIL" );
		case 8: return ( "FREQ_BAND" );
		case 9: return ( "WZONE_ACTIVE" );
		case 10: return ( "FD_STATUS" );
		case 11: return ( "SIB3_CDMA2000_HCS_PARAM" );
		case 12: return ( "RRC_CONN_REL_CAUSE" );
		case 13: return ( "CS_CALL_DROP_INFO" );
		case 14: return ( "PS_RAB_REPORT_INFO" );
	}
	return( str + "Not found" );
}

function convert_URRC_INFO_URRC_STATE_to_str( str )	// T_URRC_INFO_URRC_STATE
{
	switch (parseInt(str)) {
		case 0: return ( "NULL" );
		case 1: return ( "INACTIVE" );
		case 2: return ( "IDLE" );
		case 3: return ( "IDLE_CCCH" );
		case 4: return ( "CELL_PCH" );
		case 5: return ( "URA_PCH" );
		case 6: return ( "CELL_FACH" );
		case 7: return ( "CELL_DCH" );
	}
	return( str );
}

function convert_REG_REJECT_CAUSE_to_str( str )	// T_REG_REJECT_CAUSE
{
	switch (parseInt(str)) {
		case 0: return ( "Not Registred" );
		case 1: return ( "Invalid SIM" );
		case 2: return ( "NREG Request" );
		case 3: return ( "No Cell" );
		case 4: return ( "NO Carrier" );
		case 5: return ( "PLMN Search" );
		case 6: return ( "PLMN Search Ended" );
		case 7: return ( "AUTH Failure" );
		case 8: return ( "POWER Down" );
		case 9: return ( "FORB_PLMN" );
		case 10: return ( "FORB_LAI" );
		case 11: return ( "Detached" );
		case 12: return ( "Disabled" );
		case 13: return ( "Inavlid Parameter" );
		case 14: return ( "Rej By Network" );
		case 15: return ( "Internal Failure" );
		case 16: return ( "ATTACH TEMP BARRED" );
		case 17: return ( "NO_Cause" );
		case 18: return ( "Attach NOT Allowed" );
		case 19: return ( "Registration in Progress" );
		case 20: return ( "User ABORT" );
		case 21: return ( "Dual SIM Conflict" );
		case 22: return ( "NO Carrier Dual SIM Conflict" );
		case 23: return ( "CSG Unauthorized" );
	}
	return( str );
}

function convert_OPERATING_MODE_to_str( str )	// T_OPERATING_MODE
{
	switch (parseInt(str)) {
		case 0: return ( "Automatic Mode" );
		case 1: return ( "Manual Mode" );
	}
	return( str );
}

function convert_PLMN_INDICATOR_to_str( str )	// T_PLMN_INDICATOR
{
	switch (parseInt(str)) {
		case 0: return ( "PLMN Not provided" );
		case 1: return ( "PLMN provided" );
	}
	return( str );
}

function convert_MN_CALL_STATE_to_str( str )	// T_MN_CALL_STATE
{
	switch (parseInt(str)) {
		case 0: return ( "Mobile Originated Call SETUP" );
		case 1: return ( "Mobile Originated Call ALERTED" );
		case 2: return ( "Mobile Originated Call STARTED" );
		case 3: return ( "Mobile Originated Call ACTIVE" );
		case 4: return ( "Mobile Terminated Call CONFIRMED" );
		case 5: return ( "Mobile Terminated Call SETUP" );
		case 6: return ( "MTC_BC_NEGOTIATED" );
		case 7: return ( "Mobile Terminated Call STARTED" );
		case 8: return ( "Mobile Terminated Call ACTIVE" );
		case 9: return ( "MOC_AS_CALL_SETUP" );
		case 10: return ( "MTC_AS_CALL_SETUP" );
		case 11: return ( "Mobile Terminated Call REJECTED" );
		case 12: return ( "Call is HELD" );
		case 13: return ( "Call is RETRIEVED" );
		case 14: return ( "MPARTY_IS_ACTIVE" );
		case 15: return ( "MPARTY_IS_HELD" );
		case 16: return ( "MPARTY_IS_RETRIEVED" );
		case 17: return ( "MPARTY_IS_SPLITTED" );
		case 18: return ( "IS_ECT" );
		case 19: return ( "CALL_DISC_REQ" );
		case 20: return ( "Call is DISCONNECTED" );
		case 21: return ( "Call is CLEARED" );
		case 22: return ( "CALL_MODIFY_INDICATED" );
		case 23: return ( "CALL_MODIFY_STARTED" );
		case 24: return ( "CALL_MODIFY_COMPLETED" );
		case 25: return ( "CALL_MODIFY_REJECTED" );
		case 26: return ( "Call is DEFLECTED" );
		case 27: return ( "MPARTY_STARTED" );
		case 28: return ( "MPARTY_REJECTED" );
		case 29: return ( "MPARTY_RETRIEVE_STARTED" );
		case 30: return ( "MPARTY_RETRIEVE_REJECTED" );
		case 31: return ( "MPARTY_SPLIT_STARTED" );
		case 32: return ( "MPARTY_SPLIT_REJECTED" );
		case 33: return ( "MPARTY_HELD_STARTED" );
		case 34: return ( "MPARTY_HELD_REJECTED" );
		case 35: return ( "CALL_DEFLECTION_STARTED" );
		case 36: return ( "CALL_DEFLECTION_REJECTED" );
		case 37: return ( "Call Held STARTED" );
		case 38: return ( "Call Held REJECTED" );
		case 39: return ( "CALL_RETRIEVE_STARTED" );
		case 40: return ( "CALL_RETRIEVE_REJECTED" );
		case 41: return ( "Explicit Call Transfer STARTED" );
		case 42: return ( "Explicit Call Transfer REJECTED" );
		case 43: return ( "RADIO_LINK_FAILURE" );
		case 44: return ( "CALL_REESTABLISHMENT_COMPLETED" );
		case 45: return ( "CALL_PROCEEDING" );
	}
	return( str );
}

function convert_MM_REJECT_CAUSE_to_str( str )	// T_MM_REJECT_CAUSE
{
	switch (parseInt(str)) {
	}
	return( str );
}

function convert_MN_SS_ERROR_CODE_to_str( str )	// T_MN_SS_ERROR_CODE
{
	switch (parseInt(str)) {
	}
	return( str );
}

function convert_MN_MPTY_AUX_STATE_to_str( str )	// T_MN_MPTY_AUX_STATE
{
	switch (parseInt(str)) {
		case 0: return ( "MN_MPTY_AUX_IDLE" );
		case 1: return ( "MN_MPTY_AUX_REQUEST" );
		case 2: return ( "MN_MPTY_AUX_IN_MPTY" );
		case 3: return ( "MN_MPTY_AUX_SPLIT_REQ" );
	}
	return( str );
}

function convert_MNSI_CALL_IND_to_str( str )	// T_MNSI_CALL_IND
{
	switch (parseInt(str)) {
		case 0: return ( "Voice Call Started" );
		case 1: return ( "Voice Call Finished" );
		case 2: return ( "Data Call Started" );
		case 3: return ( "Data Call Finished" );
		case 4: return ( "PDP Context ON" );
		case 5: return ( "PDP Context OFF" );
	}
	return( str );
}

function convert_REGISTRATION_STATE_to_str( str )		// T_REGISTRATION_STATE
{
	switch (parseInt(str)) {
		case 0: return ( "Normal Service" );
		case 1: return ( "Registration Failure" );
		case 2: return ( "Limited Service" );
		case 3: return ( "NO Service" );
		case 4: return ( "AT NOT Registred" );
		case 5: return ( "Registration Service Disabled" );
		case 6: return ( "Service Detached" );
		case 7: return ( "Service Activated" );
		case 8: return ( "Emergency Service" );
		case 9: return ( "Emergency Limited" );
	}
	return( str );
}

function convert_MMRR_SUSPEND_INFO_to_str( str )		// T_MMRR_SUSPEND_INFO
{
	switch (parseInt(str)) {
		case 0: return ( "Suspension STARTED" );
		case 1: return ( "Implicit Resume" );
		case 2: return ( "Resume Req" );
	}
	return( str );
}

function convert_SUSPEND_IND_CAUSE_to_str( str )		// T_SUSPEND_IND_CAUSE
{
	switch (parseInt(str)) {
		case 0: return ( "None" );
		case 1: return ( "No Service" );
		case 2: return ( "RAT Change" );
		case 3: return ( "GPRS Hold-Call" );
		case 4: return ( "GPRS Hold-SMS" );
		case 5: return ( "GPRS Hold-LU" );
		case 6: return ( "GPRS Hold-Other" );
		case 7: return ( "Flow-Control" );
		case 8: return ( "GPRS Suspend" );
		case 9: return ( "NO_Service (DUAL SIM)" );
	}
	return( str );
}

function convert_USER_CAUSE_to_str( str )		// T_USER_CAUSE
{
	switch (parseInt(str)) {
		case 0: return ( "Power Down" );
		case 1: return ( "SIM Detach" );
		case 2: return ( "NOT Allowed" );
		case 3: return ( "Abort By User" );
		case 4: return ( "NOT Possible" );
		case 5: return ( "Disable Service" );
		case 6: return ( "Detach Service" );
		case 7: return ( "Attach Service" );
		case 8: return ( "Enable Service" );
		case 9: return ( "User Reselection" );
		case 10: return ( "AirPlane Mode" );
		case 11: return ( "Deactivate Stack" );
		case 12: return ( "FAST Detach" );
		case 13: return ( "Dual SIM Conflict" );
		case 14: return ( "Attach PS Service" );
		case 15: return ( "DATA Stall" );
	}
	return( str );
}

function convert_SIM_INDICATOR_to_str( str )		// T_SIM_INDICATOR
{
	switch (parseInt(str)) {
		case 0: return ( "SIM Not set" );
		case 1: return ( "SIM ReActivating" );
		case 2: return ( "SIM Not present" );
		case 3: return ( "SIM Present" );
		case 4: return ( "SIM ReActivated" );
		case 5: return ( "SIM Error" );
		case 6: return ( "SIM Blocked" );
		case 7: return ( "SIM Network lock" );
	}
	return( str );
}

function convert_T_TX_SLOT_TYPE_to_str( str )		// T_TX_SLOT_TYPE
{
	switch (parseInt(str)) {
		case 0: return ( "-" );
		case 1: return ( "GAP" );	/*!< Inactive TX slot - used for gaps between active TX slots */
		case 2: return ( "GSMK" );	/*!< Normal length GMSK slot */
		case 3: return ( "8PSK" );	/*!< Normal length 8PSK slot */
		case 4: return ( "RACH" );	/*!< RACH length GMSK slot */
		case 5: return ( "PAACH" );	/*!< RACH length GMSK slot used for PACCH (different handling in DSP FW) */
	}
	return( str + "Not found" );
}

function convert_SUCCESSFUL_TRANSMISSION_RSLT_to_str( str )		// T_SUCCESSFUL_TRANSMISSION_RSLT
{
	switch (parseInt(str)) {
		case 0: return ( "Unknown" );
		case 1: return ( "Failure" );
		case 2: return ( "Success" );
	}
	return( str + "Not found" );
}

function convert_RRC_CONNECTION_STATUS_to_str( str )		// T_RRC_CONNECTION_STATUS
{
	switch (parseInt(str)) {
		case 0: return ( "Persists_Established" );
		case 1: return ( "Release by NW" );
		case 2: return ( "Release by UE" );
	}
	return( str + "Not found" );
}

function convert_EST_CAUSE_to_str( str )		// T_EST_CAUSE
{
	switch (parseInt(str)) {
		case 0: return ( "Emergency Call" );
		case 1: return ( "Call ReEstablishment" );
		case 2: return ( "TCH_F_NEEDED" );
		case 3: return ( "SPEECH_TCH_H" );
		case 4: return ( "DATA_TCH" );
		case 5: return ( "Location Update" );
		case 6: return ( "Answer To Paging" );
		case 7: return ( "Other" );
		case 8: return ( "DTM Not Support" );
		case 9: return ( "OR_CONV_CALL" );
		case 10: return ( "OR_STREAM_CALL" );
		case 11: return ( "OR_INTACT_CALL" );
		case 12: return ( "OR_BACKG_CALL" );
		case 13: return ( "OR_SUBTR_CALL" );
		case 14: return ( "TE_CONV_CALL" );
		case 15: return ( "TE_STREAM_CALL" );
		case 16: return ( "TE_INTACT_CALL" );
		case 17: return ( "TE_BACKG_CALL" );
		case 18: return ( "INT_RAT_CELL_SEL" );
		case 19: return ( "INT_RAT_CELL_CHG" );
		case 20: return ( "Registration" );
		case 21: return ( "Detach" );
		case 22: return ( "OR_HIGH_PRIO" );
		case 23: return ( "OR_LOW_PRIO" );
		case 24: return ( "TE_HIGH_PRIO" );
		case 25: return ( "TE_LOW_PRIO" );
		case 26: return ( "MO_SMS" );
	}
	return( str + "Not found" );
}

function convert_AudioSamplingRate_to_str( str )	// UtaAudioSamplingRateEnum
{
	switch (parseInt(str)) {
		case 0: return ( "8KHZ" );	///< Sample rate of 8 kHz
		case 1: return ( "11KHZ" );	///< Sample rate of 11.025 kHz
		case 2: return ( "12KHZ" );	///< Sample rate of 12 kHz
		case 3: return ( "16KHZ" );	///< Sample rate of 16 kHz
		case 4: return ( "22KHZ" );	///< Sample rate of 22.05 kHz
		case 5: return ( "24KHZ" );	///< Sample rate of 24 kHz
		case 6: return ( "32KHZ" );	///< Sample rate of 32 kHz
		case 7: return ( "44KHZ" );	///< Sample rate of 44.1 kHz
		case 8: return ( "48KHZ" );	///< Sample rate of 48 kHz
		case 9: return ( "96KHZ" );	///< Sample rate of 96 kHz
		case 10: return ( "192KHZ" );///< Sample rate of 192 kHz
		case 11: return ( "END" );	///< Invalid, only used internally
	}
	return( str + "Not found" );
}

function convert_UtaNetRegistrationStatus_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return ( "NORMAL");			// UTA_NET_REGISTRATION_STATUS_NORMAL_SERVICE = 0,		/**< Indicates that an authorized PLMN is available and the user  can use all subscribed services, withstanding restrictions  in the PLMN and on the SIM. */
		case 1: return ( "FAILURE");		// UTA_NET_REGISTRATION_STATUS_FAILURE = 1,				/**< Normal service is available, but before any service can be used, a location update is necessary */
		case 2: return ( "LIMITED");		// UTA_NET_REGISTRATION_STATUS_LIMITED_SERVICE = 2,		/**< Only emergency services (CS Emergency Call) are available because no authorized PLMN could be found or SIM is not present */
		case 3: return ( "NO_SERVICE");		// UTA_NET_REGISTRATION_STATUS_NO_SERVICE = 3,				/**< No PLMN could be found, so no service is available. */
		case 4: return ( "AT_NO_REG");		// UTA_NET_REGISTRATION_STATUS_AT_NOT_REGISTERED = 4,		/**< Client AT is not registered. */
		case 5: return ( "DISABLED");		// UTA_NET_REGISTRATION_STATUS_SERVICE_DISABLED = 5,		/**< The service is not enabled. PLMN search will not be performed. */
		case 6: return ( "DETACHED");		// UTA_NET_REGISTRATION_STATUS_SERVICE_DETACHED = 6,		/**< The service is detached. PLMN search will not be performed.*/
		case 7: return ( "PS_EMERGENCY");	// UTA_NET_REGISTRATION_STATUS_PS_EMERGENCY = 7,			/**< Indicates that UE is registered for emergency services on PS domain. */
		case 8: return ( "PS_LIMITED");		// UTA_NET_REGISTRATION_STATUS_PS_EMERGENCY_LIMITED = 8	/**< Indicates that UE is emergency registered to the network on PS domain, 	but currently in limited service as no cell belonging to the registered network is found */
	}
	return( str + "Not found" );
}

function convert_AS_SearchType_to_str( str )	// T_AS_SEARCH_TYPE
{
	switch (parseInt(str)) {
		case 0: return( "No valid search" );
		case 1: return( "SLS" );
		case 2: return( "DBS" );
		case 3: return( "RBS" );
		case 4: return( "SBS" );
		case 5: return( "FBS" );
		case 6: return( "SLS_DBS" );
	}
	return( str + "Not found" );
}

function convert_AS_SERVICE_MODE_to_str( str )	// T_AS_SERVICE_MODE
{
	switch (parseInt(str)) {
		case 0: return( "Normal" );
		case 1: return( "Limited" );
		case 2: return( "Emergency" );
	}
	return( str + "Not found" );
}

function convert_ACCESS_TECHNOLOGY_to_str( str )	// T_ACCESS_TECHNOLOGY
{
	switch (parseInt(str)) {
		case 0: return( "GSM" );
		case 1: return( "GPRS" );
		case 2: return( "EGPRS" );
		case 3: return( "EGPRS(PCR)" );
		case 4: return( "EGPRS(EPCR)" );
		case 5: return( "UMTS" );
		case 6: return( "DTM" );
		case 7: return( "EGPRS_DTM" );
		case 8: return( "LTE" );
		case 9: return( "UNDEFINED" );
	}
	return( str + "Not found" );
}

function convert_IR_GSM_BAND_INDICATOR_to_str( str )	// T_IR_GSM_BAND_INDICATOR
{
	switch (parseInt(str)) {
		case 0: return( "Band INVALID" );
		case 1: return( "Band Unknown" );
		case 2: return( "DCS1800" );
		case 3: return( "PCS1900" );
	}
	return( str + "Not found" );
}

function convert_URRC_STATE_to_str( str )	// T_URRC_STATE
{
	switch (parseInt(str)) {
		case 0: return( "Cell DCH" );
		case 1: return( "Cell FACH" );
		case 2: return( "Cell PCH" );
		case 3: return( "URA PCH" );
		case 4: return( "IDLE" );
		case 5: return( "IDLE CCCH" );
	}
	return( str + "Not found" );
}

function convert_CN_DOMAIN_ID_to_str( str )	// T_CN_DOMAIN_ID
{
	switch (parseInt(str)) {
		case 0: return( "CMN Domain" );
		case 1: return( "CS Domain" );
		case 2: return( "PS Domain" );
		case 3: return( "ALL Domains" );
	}
	return( str + "Not found" );
}

function convert_TIMER_NUMBER_to_str( str )	// T_TIMER_NUMBER
{
	switch (parseInt(str)) {
		case 0: return( "Timer1" );
		case 1: return( "Timer2" );
		case 2: return( "Timer3" );
		case 3: return( "Timer4" );
		case 4: return( "Timer5" );
		case 5: return( "Timer6" );
		case 6: return( "Invalid" );
	}
	return( str + "Not found" );
}

function convert_PTM_STATE_to_str( str )
{
	switch (parseInt(str)) {
		case 0: return( "INACTIVE" );
		case 1: return( "ACTIVE" );
		case 2: return( "SUSPENDED" );
		case 3: return( "FLOW_CONTROL" );
		case 4: return( "TEST_MODE" );
	}
	return( str + "Not found" );
}

function convert_MM_TASK_STATUS_to_str( str )	// T_MM_TASK_STATUS
{
	switch (parseInt(str)) {
		case 0: return( "NONE" );
		case 1: return( "Open" );
		case 2: return( "InWork" );
		case 3: return( "Suspended" );
		case 4: return( "Ready" );
		case 5: return( "Paused" );
		case 6: return( "Aborting" );
		case 7: return( "Incomplete" );
		case 8: return( "Complete" );
	}
	return( str + "Not found" );
}

function convert_SM_Cause_to_str( str )	// 3GPP TS 24.008 version 9.10.0 Release 9  ?10.5.6.6 SM cause
{
	switch (parseInt(str)) {
		case 0: return( "OK" );
		case 8: return( "Operator Determined Barring" );
		case 24: return( "MBMS bearer capabilities insufficient for the service" );
		case 25: return( "LLC or SNDCP failure(A/Gb mode only)" );
		case 26: return( "Insufficient resources" );
		case 27: return( "Missing or unknown APN" );
		case 28: return( "Unknown PDP address or PDP type" );
		case 29: return( "User authentication failed" );
		case 30: return( "Activation rejected by GGSN, Serving GW or PDN GW" );
		case 31: return( "Activation rejected, unspecified" );
		case 32: return( "Service option not supported" );
		case 33: return( "Requested service option not subscribed" );
		case 34: return( "Service option temporarily out of order" );
		case 35: return( "NSAPI already used (not sent)" );
		case 36: return( "Regular deactivation" );
		case 37: return( "QoS not accepted" );
		case 38: return( "Network failure" );
		case 39: return( "Reactivation required" );
		case 40: return( "Feature not supported" );
		case 41: return( "Semantic error in the TFT operation" );
		case 42: return( "Syntactical error in the TFT operation" );
		case 43: return( "Unknown PDP context" );
		case 44: return( "Semantic errors in packet filter(s)" );
		case 45: return( "Syntactical errors in packet filter(s)" );
		case 46: return( "PDP context without TFT already activated" );
		case 47: return( "Multicast group membership time-out" );
		case 48: return( "Activation rejected, BCM violation" );
		case 50: return( "PDP type IPv4 only allowed" );
		case 51: return( "PDP type IPv6 only allowed" );
		case 52: return( "Single address bearers only allowed" );
		case 56: return( "Collision with network initiated request" );
		case 81: return( "Invalid transaction identifier value" );
		case 95: return( "Semantically incorrect message" );
		case 96: return( "Invalid mandatory information" );
		case 97: return( "Message type non-existent or not implemented" );
		case 98: return( "Message type not compatible with the protocol state" );
		case 99: return( "Information element non-existent or not implemented" );
		case 100: return( "Conditional IE error" );
		case 101: return( "Message not compatible with the protocol state" );
		case 111: return( "Protocol error, unspecified" );
		case 112: return( "APN restriction value incompatible with active PDP context" );
	}
	return( str + "Not found" );
}

function convert_MS_CLASS_to_str( str )	// T_MS_CLASS
{
	switch (parseInt(str)) {
		case 0: return( "ClassA" );
		case 1: return( "ClassB" );
		case 2: return( "ClassC" );
		case 3: return( "ClassCC" );
		case 4: return( "ClassCG" );
		case 5: return( "NO Class" );
	}
	return( str + "Not found" );
}

function convert_GMMSM_CAUSE_to_str( str )	// T_GMMSM_CAUSE
{
	switch (parseInt(str)) {
		case 0: return( "Detached" );
		case 1: return( "Deatch with Reacttach" );
		case 2: return( "Attach not Possible" );
		case 3: return( "NO PDP Context Active" );
		case 4: return( "Cell Barred" );
		case 5: return( "Service Fail" );
		case 6: return( "Lower Failure" );
		case 7: return( "Dual Sim conflict" );
		case 8: return( "Auth Failure emergency ONLY" );
		case 9: return( "Emergency Attach" );
		case 10: return( "Emergency Not Possible" );
	}
	return( str + "Not found" );
}

function convert_RxLev_to_DBm( str )
{
	var rxlev_dBm = "";

	try {
		var rxlevVal = parseInt( str );
		if (rxlevVal == 0)
			rxlev_dBm = "(<-110 dBm)";
		else if (rxlevVal == 63)
			rxlev_dBm = "(>-48 dBm)";
		else if (rxlevVal != 99)
			rxlev_dBm = (-110+rxlevVal)+" dBm";
	} catch(e) {
		logException( e );
	}

	return( rxlev_dBm );
}


function convert_dlEarfcn_to_band( dlEarfcnStr )
{
	var f = parseInt(dlEarfcnStr);
	if (f >= 0 && f <=599)          return "FDD Band 1";
	else if (f >= 600 && f <=1199)  return "FDD Band 2";
	else if (f >= 1200 && f <=1949)	return "FDD Band 3";
	else if (f >= 1950 && f <=2399)	return "FDD Band 4";
	else if (f >= 2400 && f <=2649)	return "FDD Band 5";
	else if (f >= 2650 && f <=2749)	return "FDD Band 6";
	else if (f >= 2750 && f <=3449)	return "FDD Band 7";
	else if (f >= 3450 && f <=3799)	return "FDD Band 8";
	else if (f >= 3800 && f <=4149)	return "FDD Band 9";
	else if (f >= 4150 && f <=4749)	return "FDD Band 10";
	else if (f >= 4750 && f <=4949)	return "FDD Band 11";
	else if (f >= 5010 && f <=5179)	return "FDD Band 12";
	else if (f >= 5180 && f <=5279)	return "FDD Band 13";
	else if (f >= 5280 && f <=5379)	return "FDD Band 14";
	else if (f >= 5730 && f <=5849)	return "FDD Band 17";
	else if (f >= 5850 && f <=5999)	return "FDD Band 18";
	else if (f >= 6000 && f <=6149)	return "FDD Band 19";
	else if (f >= 6150 && f <=6449)	return "FDD Band 20";
	else if (f >= 6450 && f <=6599)	return "FDD Band 21";
	else if (f >= 6600 && f <=7399)	return "FDD Band 22";
	else if (f >= 7500 && f <=7699)	return "FDD Band 23";
	else if (f >= 7700 && f <=8039)	return "FDD Band 24";
	else if (f >= 8040 && f <=8689)	return "FDD Band 25";
	else if (f >= 8690 && f <=9039)	return "FDD Band 26";
	else if (f >= 9040 && f <=9209)	return "FDD Band 27";
	else if (f >= 9210 && f <=9659)	return "FDD Band 28";
	else if (f >= 9660 && f <=9769)	return "FDD Band 29";
	else if (f >= 9770 && f <=9869)	return "FDD Band 30";
	else if (f >= 9870 && f <=9919)	return "FDD Band 31";

	else if (f >= 36000 && f <=36199) return "TDD Band 33";
	else if (f >= 36200 && f <=36349) return "TDD Band 34";
	else if (f >= 36350 && f <=36949) return "TDD Band 35";
	else if (f >= 36950 && f <=37549) return "TDD Band 36";
	else if (f >= 37550 && f <=37749) return "TDD Band 37";
	else if (f >= 37750 && f <=38249) return "TDD Band 38";
	else if (f >= 38250 && f <=38649) return "TDD Band 39";
	else if (f >= 38650 && f <=39649) return "TDD Band 40";
	else if (f >= 39650 && f <=41589) return "TDD Band 41";
	else if (f >= 41590 && f <=43589) return "TDD Band 42";
	else if (f >= 43590 && f <=45589) return "TDD Band 43";
	else if (f >= 45590 && f <=46589) return "TDD Band 44";
	else
		return "";
}

//////////////////////////////////////////////////
function trim( str )
{
	var variable = new String( str );
	var reg = new RegExp("^\\s+|\\s+$", "g");
	return variable.replace( reg, "");
}

//////////////////////////////////////////////////
function Build_MccMnc( MCC, MNC )
{
	var result;

	try {
		if( ( !"".equals(MCC)) &&  (!"".equals(MNC)))
		{
			var mncStr = "";
			if (MNC != "FF")  mncStr = trim( new String(MNC).replace("F", ""));

			var numMNC;
			if(!mncStr.equals(""))
			{
				try {
					numMNC = Integer.parseInt(mncStr);
					MNC = numMNC.toString();
				} catch(e) {
					logException( e );
				}
			}
		}
	} catch(e) {
		logException( e );
	}
	result = MCC + "/" + MNC;

	return result;
}

//////////////////////////////////////////////////
// Extract the completition flag
function GetComplete_Flag( msg, message, param )
{
	var result = "";

	try {
		searchComplete = new String(service.getDecodedStructValue(PanelLG, msg, message, param));
		if(!searchComplete.equals(""))
		{
			if(searchComplete.indexOf("True") != -1)
			{
				result += "Complete ";
			}else if(searchComplete.indexOf("False") != -1)
			{
				result += "Incomplete ";
			}
		}
	} catch(e) {
		logException( e );
	}

	return( result );
}

// Extract the completition flag
function GetGSMBandInfo( msg, PayloadName, param )
{
	var band_list = ["P_GSM_900", "E_GSM_900", "R_GSM_900", "DCS_1800", "PCS_1900", "GSM_450", "GSM_480", " GSM_850"];
	var result = "";
	var bandStr = "";
	var idx;

	try {
		bandStr = new String(service.getDecodedStructValue(PanelLG, msg, PayloadName, param ));
		if(!bandStr.equals("") && !bandStr.equals("-1") && !bandStr.equalsIgnoreCase("Insufficient data"))
		{
			var band = Integer.parseInt(bandStr, 10);
			for (idx = 0; idx < band_list.length; idx++)
			{
				if ((band & (0x01<<idx)) != 0)
				{
					result += " " + band_list [idx];
				}
			}
		}
	} catch(e) {
		logException( e );
	}

	return( result );
}

function PropertyFile_Read(  )
{
	try {
//		var dir = new File(".");
//		var canonicalPath = dir.getCanonicalPath();
//		var filepath = canonicalPath + "\\scripts\\MasterScript_OperatorList.txt " ;
		var user = System.getProperty("user.home");
		var filepath = user +"\\stt\\workspace\\scripts\\MasterScript_OperatorList.txt";
		logMessage( "PropertyFile_Read filepath="+filepath );
		var fis = new FileReader( filepath );
		var br = new BufferedReader( fis );
		var s;
		var lineNum;

		for (lineNum = 0; (s = br.readLine()) != null; lineNum++)
			{
			var posSep = s.indexOf(",");
			var code = s.substr(0,posSep);
			var name = s.substr(posSep+1);
			code = code.trim();
			name = name.replace("\"","");
			name = name.replace("\"","");
			name = name.trim();
			operator_code[lineNum] = code;
			operator_name[lineNum] = name;
			}
		fis.close();
//		logMessage( "PropertyFile_Read loaded="+operator_code.length );

//		for (lineNum = 0; lineNum < 15; lineNum++)
//			logMessage( "code=["+operator_code[lineNum]+"] name=["+operator_name[lineNum]+"]" );

	} catch (e) {
		logException( e );
	}
}

function findProperties( OperatorCode )
{
	var index;

	if (operator_code.length == 0)
		PropertyFile_Read( );

	for (index = 0; index < operator_code.length; index++)
		if (operator_code[index] == OperatorCode)
			return( operator_name[index] );

//	if ((index =  operator_code.indexOf( OperatorCode )) != -1)
//		return( operator_name[index] );

//	logMessage( "findProperties code=["+OperatorCode+"] not found]" );
	return( "" );
}

function GetAndBuild_MccMnc( msg, SearchStr, useUpperCase, getOperator )
{
	var MCC, MNC, MCCStr, MNCStr;
	var result;

	if (useUpperCase == 1)
	{
		MCCStr = "MCC";
		MNCStr = "MNC";
	}
	else
	{
		MCCStr = "mcc";
		MNCStr = "mnc";
	}
	try {
		MCC = new String(service.getDecodedStructValue(PanelLG, msg, SearchStr, MCCStr));
		MNC = new String(service.getDecodedStructValue(PanelLG, msg, SearchStr, MNCStr));

		if (useUpperCase == 0)
		{
			MCC = new String(intToHexString( MCC, 4 ));
			MCC = MCC.substring( 1, 2) + MCC.substring( 0, 1) + MCC.substring( 3, 4) + MCC.substring( 2, 3);
			if (MCC.substring( 3, 4) == "F")
				MCC = MCC.substring( 0, 3);
			MNC = new String(intToHexString( MNC, 2 ));
			MNC = MNC.substring( 1, 2) + MNC.substring( 0, 1);
		}
		else
		{
			if (MNC.substring( 2, 3) == "F")
				MNC = MNC.substring( 0, 2);
			if (MNC.substring( 0, 1) == "0")
				MNC = MNC.substring( 1, 2);
		}
	} catch(e) {
		logException( e );
		MCC = new String("");
		MNC = new String("");
	}
	result = Build_MccMnc( MCC, MNC );
	if (getOperator == 1 )
		result = result + ":" + findProperties( result );
	return( result );
}

function URRC_GetAndBuild_MccMnc( msg, SearchStr, useUpperCase, getOperator )
{
	var MCC, MNC, MCCStr, MNCStr;
	var result;

	if (useUpperCase == 1)
	{
		MCCStr = "MCC";
		MNCStr = "MNC";
	}
	else
	{
		MCCStr = "mcc";
		MNCStr = "mnc";
	}
	try {
		MCC = new String(service.getDecodedStructValue(PanelLG, msg, SearchStr, MCCStr));
		MNC = new String(service.getDecodedStructValue(PanelLG, msg, SearchStr, MNCStr));

		MCC = new String(intToHexString( MCC, 4 ));
		if (MCC.substring( 0, 1) == "F")
			MCC = MCC.substring( 1, 4);
		MNC = new String(intToHexString( MNC, 2 ));
		MNC = MNC.substring( 1, 2) + MNC.substring( 0, 1);
	} catch(e) {
		logException( e );
		MCC = new String("");
		MNC = new String("");
	}
	result = Build_MccMnc( MCC, MNC );
	if (getOperator == 1 )
		result = result + ":" + findProperties( result );
	return( result );
}

function UtaGetAndBuild_MccMnc( msg, SearchStr, getOperator )
{
	var MCC, MNC;
	var result;

	var MCCStr = "mcc";
	var MNCStr = "mnc";
	try {
		MCC = new String(service.getDecodedStructValue(PanelLG, msg, SearchStr, MCCStr));
		MNC = new String(service.getDecodedStructValue(PanelLG, msg, SearchStr, MNCStr));

	} catch(e) {
		logException( e );
		MCC = new String("");
		MNC = new String("");
	}
	result = Build_MccMnc( MCC, MNC );
	if (getOperator == 1 )
		result = result + ":" + findProperties( result );
	return( result );
}

function GetJavaScriptVersion( )
{
	return( System.getProperty("java.version") );
}

function GetHSDPA_HSUPA( msg, MessageName, startParam )
{
	// HSDPA
	var HSDPA = "";
	try {
		HSDPA = convert_TrueFalse_to_str(stripLiteralValue(service.getDecodedStructValue(PanelLG, msg, MessageName, "Param" + startParam )));
	} catch(e) {
		logException( e );
		HSDPA = "";
	}

	startParam = Integer.parseInt(startParam) + 1;
	// HSUPA
	var HSUPA = "";
	try {
		HSUPA = convert_TrueFalse_to_str(stripLiteralValue(service.getDecodedStructValue(PanelLG, msg, MessageName, "Param" + startParam )));
	} catch(e) {
		logException( e );
		HSUPA = "";
	}

	return "HSDPA:"+HSDPA+", HSUPA:"+HSUPA;
}

function DebugDumpStr( str )
{
	var  i;
	script.log( "DebugDumpStr" );

	script.log( "XXXXlen=" + len + " StrLen=" + str.length());
	for (i = 0; i < 100; i++){
		script.log( "Offset=" + i );
		var c = str.charAt(i);
		script.log( "Offset=" + i + " Char=" + c );
		}
}

function DebugDumpVector( bContent )
{
	var Index = 0;
	for (var line = 0; line < 5 && Index < bContent.length; line++)
	{
		var Buffer = "";
		for (var i = 0; i < 16; i++)
		{
			Buffer += intToHexString( bContent[Index], 2 ) + " ";
			Index++;
			if (Index >= bContent.length)
				break;
		}
		logMessage("line("+line+")=["+Buffer+"]");
	}
}

///////////////////////////////////////////////
function convert_uint2str( value )
{
	if (value < 0)
		value = 256 + value;

	return value.toString();
}

///////////////////////////////////////////////
function IsEmpty( variable )
{
	if (variable === null || variable == "" || variable == "null")
		return( true );

	return( false );
}

///////////////////////////////////////////////
function ParseInt( variable )
{
	try {
		return Integer.parseInt( variable );
	} catch (e) {
	}

	try {
		variable = trim(variable);
		var PartFirst = variable.substr(0,variable.length - 1);
		var PartLast  = variable.substr(variable.length - 1);
		var resu = Integer.parseInt(PartFirst) * 10 + Integer.parseInt(PartLast);
		return resu;
	} catch (e) {
		logException( e );
	}

	return( -1 );
}

///////////////////////////////////////////////
function return_word(a, b)
{
	var result = (a<<8) + b;
	return result;
}

///////////////////////////////////////////////
function getContentSafely(msg)
{
	var type = new String(msg.getMessageType());

	var raw = msg.getValue("_Decoder Message");
	raw = new String(raw.replaceAll(" ", ""));

	if(new java.lang.String(raw).length() >= 2) {
		var sign = new BigInteger(raw.substring(0, 2) ,16).byteValue();
		var contents =  new BigInteger(raw, 16).toByteArray();
		var temp;
		if(sign < 0) {
			//removing 1 byte as sign info
			temp = Arrays.copyOfRange(contents, 1, contents.length);
		}
		else {
			temp = contents;
		}

		if("sdl".equalsIgnoreCase(type)) {
			if(temp.length >= 10) {
				temp = Arrays.copyOfRange(temp, 10, temp.length);
			}
			else {
				temp = new BigInteger("00", 16).toByteArray();
				return Arrays.copyOfRange(temp, 1, temp.length); //return 0 length byte array
			}
		}
		if("llt".equalsIgnoreCase(type)) {
			if(temp.length >= 7) {
				temp = Arrays.copyOfRange(temp, 7, temp.length);
			}
			else {
				temp = new BigInteger("00", 16).toByteArray();
				return Arrays.copyOfRange(temp, 1, temp.length);//return 0 length byte array
			}
		}
		if("mon".equalsIgnoreCase(type)) {
			if(temp.length >= 6) {
				temp = Arrays.copyOfRange(temp, 6, temp.length);
			}
			else {
				temp = new BigInteger("00", 16).toByteArray();
				return Arrays.copyOfRange(temp, 1, temp.length);//return 0 length byte array
			}
		}
		return temp;
	}
	else {
		temp = new BigInteger("00", 16).toByteArray();
		return Arrays.copyOfRange(temp, 1, temp.length);//return 0 length byte array
	}
}

//////////////////////////////////////////////////
function getEXTRA_INFO( msg )
{
	var hm = msg.getFieldsValueMap( );
	var msgExtraInfo = hm.get( "EXTRA_INFO" );
	if (IsEmpty(msgExtraInfo))
		msgExtraInfo = hm.get( "LTE PS Info" );

	if (msgExtraInfo != null)
		return trim(msgExtraInfo);
	return msgExtraInfo;
}

//////////////////////////////////////////////////
function getLOG_TYPE( msg )
{
	var hm = msg.getFieldsValueMap( );
	var msgLogType = hm.get( "LOG_TYPE" );
	if (IsEmpty(msgLogType))
		msgLogType = hm.get( "Message Type" );

	return msgLogType;
}

///////////////////////////FSP nou used /////////////////////////////////////////
function dec_INTARFCN( arfcn)
{
	var stringToReturn = "";
	var radix = 10;

	if (arfcn>=0)
	{
		//check if MobileAnalyser displays the Date in HEX or DEC in the moment
		//  if (IpcMessage.displayDataHex)
		//    radix = 16;
		//  else
		//    radix = 10;

		//logMessage("dec_INTARFCN arfcn: " + arfcn);

		// if arfcn is bigger or equal than 32768,
		// then the highest bit is set,
		// and that is the indication, that it is an arfcn in the band PCS_1900
		if (arfcn >= 32768)
		{
			arfcn -= 32768;
			if (radix == 16)
			{
				//stringToReturn.append("P-");
				//stringToReturn.append(Integer.toHexString(arfcn).toUpperCase());
			}
			else
			{
				stringToReturn+=("P-"+arfcn);
			}
		}
		else
		{
			stringToReturn+=(arfcn);
		}
	}
	else
	{
		stringToReturn+=("(Error no arfcn to display)");
	}

	return stringToReturn.toString();
}

function get_channel_type( str_chan_type )
{
	var result = "Type?";

	//logMessage(" in get channel type :   " +  str_chan_type );

	if (str_chan_type.toString().equals("1")) result = "TCH_F";
	if (str_chan_type.toString().equals("2")) result = "TCH_H";
	if (str_chan_type.toString().equals("3")) result = "SDCCH_4";
	if (str_chan_type.toString().equals("4")) result = "SDCCH_8";
	if (str_chan_type.toString().equals("5")) result = "TCH_H_H";
	if (str_chan_type.toString().equals("6")) result = "TCH_F_M";

	return result;
}

 ///////////////////////////////////////////////////////////////////////
function process__dec_layer3( msg )
{
	var decoding = "";
	try {
		decoding = new String(service.getDecodedStructValue(PanelLG, msg, "Derefrenced Pointer Data", "Pointer_0 : Layer 3 Message"));
	} catch(e) {
		logException( e );
		decoding = new String("");
	}
	return dec_layer3(decoding);
}

//===========================================================================================================================
//	Jagan---start
//===========================================================================================================================
//Jagan
function dec_urrcdc_xia_trace_data(istream,direction)
{
	var result = "";
	var Procedure_ID ="";
	var ProcedureState ="";
	var len = iStream.available();
	try {
		if (len < 13)
		{
			result = direction +"-";
			iStream.skipBytes(4);  // skip adresse bytes
			var pdu_length = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			var channel = iStream.readUnsignedByte();
			var msg_type= iStream.readUnsignedByte();
			var rrc_ti= iStream.readUnsignedByte();
			var nas_pd = iStream.readUnsignedByte();
			var nas_msg_type= iStream.readUnsignedByte();
			var nas_ti= iStream.readUnsignedByte();

			if (direction=="DL")
			{
				switch (channel)
				{
				case 15:
					result +="DCCH_DCH";
					break;
				case 16:
					result +="DCCH_EDCH";
					break;
				case 17:
					result +="BCCH_BCH";
					break;
				case 18:
					result +="BCCH_FACH";
					break;
				case 19:
					result +="BCCH_HSDSCH";
					break;
				case 20:
					result +="PCCH_PCH";
					break;
				case 21:
					result +="PCCH_HSDSCH";
					break;
				case 22:
					result +="CCCH_FACH";
					break;
				case 23:
					result +="CCCH_HSDSCH";
					break;
				case 24:
					result +="DCCH_FACH";
					break;
				case 25:
					result +="DCCH_HSDSCH";
					break;
				default:
					result +=" NOT APPLICABLE";
					break;
				}
			}
			else
			{
				switch (channel)
				{
				case 15:
					result +="DCCH_DCH";
					break;
				case 16:
					result +="DCCH_EDCH";
					break;
				case 13:
					result +="CCCH_RACH";
					break;
				case 14:
					result +="DCCH_RACH";
					break;
				default:
					result +=" NOT APPLICABLE";
					break;
				}
			}

			result += ":  MsgType=" +msg_type + " RrcTi=" +rrc_ti + " NasPd="+nas_pd + " NasMsgType=" + nas_msg_type + " NasTi="+ nas_ti;
		}
		else
		{
			result = "Message length="+len +" bigger than 12";
		}
	} catch(e) {
		logException( e );
	}
	return result;
}

//===========================================================================================================================
//	Jagan---end
//===========================================================================================================================

//===========================================================================================================================
//	NAGIREDDY---start
//===========================================================================================================================
function latitude_to_degree(latitude)
{
	var dNLat = Math.pow(2,23) / 90;  // 0 - 90 degrees N = dLatDeg*2^23 / 90

	var dLat = latitude / dNLat;
	dLat = Math.round(dLat*1000000)/1000000.;  // rounds to the 6th decimal place == resolution of position in Google Maps

	return dLat;
}

function longtitude_to_degree(longtitude)
{
	var dNLon = Math.pow(2,24) / 360;  // -180 .. +180   N = dLonDeg*2^24 /360

	var dLon = longtitude / dNLon;
	dLon = Math.round(dLon*1000000)/1000000.;  // rounds to the 6th decimal place == resolution of position in Google Maps

	return dLon;
}

function get_GPS_coordinates( iStream )
{
	var result = "";
	var sign_of_lat;
	var latitude, longitude;

	var latitude_degree   = 0;
	var longtitude_degree = 0;
	try {
		var status = iStream.readUnsignedByte();
		if( status == 0 )
		{
			iStream.skipBytes(9);  // skip fill byte, ref_frame, gps_tow, fix_type, shape_type

			sign_of_lat = iStream.readUnsignedByte();
			iStream.skipBytes(1);  // skip fill byte

			latitude    = swapbyte_return_long(iStream.readUnsignedByte(), iStream.readUnsignedByte(), iStream.readUnsignedByte(), iStream.readUnsignedByte());
			longitude   = swapbyte_return_long(iStream.readUnsignedByte(), iStream.readUnsignedByte(), iStream.readUnsignedByte(), iStream.readUnsignedByte());

			latitude_degree   = latitude_to_degree(latitude);
			longtitude_degree = longtitude_to_degree(longitude);

			// print("latitude_degree# "+ latitude_degree + "\n");
			// print("longtitude_degree# "+ longtitude_degree + "\n");
			if( sign_of_lat == 1 )
				latitude_degree *= -1;

			result = latitude_degree + TYPE_SEP + longtitude_degree;
		}
	} catch(e) {
		logException( e );
	}
	return result;
}

//===========================================================================================================================
//	NAGIREDDY---End
//===========================================================================================================================
//////////////////////////////////////////
function ASN1_SplitSentence( ASN1_Sentence, myASN1_Obj )
{
	var i;
	myASN1_Obj.ASN1_BracketCount = 0;
	myASN1_Obj.ASN1_BracketSum = 0;
	myASN1_Obj.ASN1_BracketMember = 0;
	myASN1_Obj.ASN1_Title = "";
	myASN1_Obj.ASN_Members = new Array();
	myASN1_Obj.ASN_Members[myASN1_Obj.ASN1_BracketMember] = "";
	for (i = 0; i < ASN1_Sentence.length; i++)
	{
		if (ASN1_Sentence[i] == "{")
		{
			myASN1_Obj.ASN1_BracketCount++;
			myASN1_Obj.ASN1_BracketSum++;
		}
		if (myASN1_Obj.ASN1_BracketCount == 0)		myASN1_Obj.ASN1_Title += ASN1_Sentence[i];
		if (myASN1_Obj.ASN1_BracketCount > 1 || (myASN1_Obj.ASN1_BracketCount == 1 && ASN1_Sentence[i] != "{"))
									myASN1_Obj.ASN_Members[myASN1_Obj.ASN1_BracketMember] += ASN1_Sentence[i];
		if (ASN1_Sentence[i] == "}")
		{
			myASN1_Obj.ASN1_BracketCount--;
			myASN1_Obj.ASN1_BracketSum++;
			if (myASN1_Obj.ASN1_BracketCount == 1)
			{
				myASN1_Obj.ASN1_BracketMember++;
				myASN1_Obj.ASN_Members[myASN1_Obj.ASN1_BracketMember] = "";
			}
		}
	}

	while (myASN1_Obj.ASN1_Title[0] == " " || myASN1_Obj.ASN1_Title[0] == "," || myASN1_Obj.ASN1_Title[0] == "\n")
		myASN1_Obj.ASN1_Title = myASN1_Obj.ASN1_Title.substring(1);

	while (myASN1_Obj.ASN1_Title.slice(-1) == ":" || myASN1_Obj.ASN1_Title.slice(-1) == " " || myASN1_Obj.ASN1_Title.slice(-1) == "\n")
		myASN1_Obj.ASN1_Title = myASN1_Obj.ASN1_Title.substring(0,myASN1_Obj.ASN1_Title.length-1);
}

//////////////////////////////////////////
function ASN1_Parsing( msg )
{
	var result = "";

	try {
		var decoding = new String(service.getDecodedStructValue(PanelLG, msg, "Derefrenced Pointer Data", "Pointer_0 : ASN1 Message"));

		var indexSpace;
		var TypeOfTransfer = "";

		// Remove the first line
		var patternStr = new RegExp(".*\n");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
			decoding = decoding.substring( matcher[0].length );

		var myASN1_Obj = new Object();
		myASN1_Obj.ASN1_BracketCount = 0;
		myASN1_Obj.ASN1_BracketSum   = 0;
		myASN1_Obj.ASN1_BracketMember= 0;
		myASN1_Obj.ASN1_Title         = "";
		myASN1_Obj.ASN_Members       = new Array();
		ASN1_SplitSentence( decoding, myASN1_Obj );
/*
if (myASN1_Obj.ASN1_BracketMember == 0)
{
	logMessage("myASN1_Obj.ASN1_BracketCount: ["+myASN1_Obj.ASN1_BracketCount+"]" );
	logMessage("myASN1_Obj.ASN1_BracketSum:   ["+myASN1_Obj.ASN1_BracketSum+"]" );
	logMessage("myASN1_Obj.ASN1_BracketMember:["+myASN1_Obj.ASN1_BracketMember+"]" );
	logMessage("myASN1_Obj.ASN1_Title:        ["+myASN1_Obj.ASN1_Title+"]" );
	logMessage("decoding:                     ["+decoding+"]");
}*/

		// Compyte the type of transfer
		var title = new String(myASN1_Obj.ASN1_Title);
		var patternStr = new RegExp("value .*_Message");
		var matcher = patternStr.exec( title );
		if (void 0 != matcher)
		{
			TypeOfTransfer = matcher[0].substring(6);
			TypeOfTransfer = TypeOfTransfer.substring(0,TypeOfTransfer.length-8);
		}
		result = TypeOfTransfer + ": " ;

		for (i = 0; i < myASN1_Obj.ASN1_BracketMember; i++)
		{
			var myASN1_SecondLevel_Obj = new Object();
			myASN1_SecondLevel_Obj.ASN1_BracketCount = 0;
			myASN1_SecondLevel_Obj.ASN1_BracketSum   = 0;
			myASN1_SecondLevel_Obj.ASN1_BracketMember= 0;
			myASN1_SecondLevel_Obj.ASN1_Title         = "";
			myASN1_SecondLevel_Obj.ASN_Members       = new Array();
			ASN1_SplitSentence( myASN1_Obj.ASN_Members[i], myASN1_SecondLevel_Obj );

			var title = new String(myASN1_SecondLevel_Obj.ASN1_Title);
			var sentence = new String(myASN1_Obj.ASN_Members[i]);
			var patternStr = new RegExp(".*_Message");
			var matcher = patternStr.exec( title );
			if (void 0 != matcher)
			{
				var MessageName = title.substring( matcher[0].length );
				if (strStartsWith( MessageName, "Type_")) MessageName = MessageName.substring(5);
				if (strStartsWith( MessageName, "_")) MessageName = MessageName.substring(1);
				indexSpace = MessageName.indexOf( " ");
				if (indexSpace != -1)
					MessageName = MessageName.substring( 0, indexSpace);

//logMessage( "ASN1 Token="+MessageName.toString() );
				switch (MessageName.toString())
				{
				case "activeSetUpdateComplete":
					result += "ACTIVE SET UPDATE COMPLETE";
					break;

				case "activeSetUpdateFailure":
					result += "ACTIVE SET UPDATE FAILURE";
					break;

				case "cellChangeOrderFromUtranFailure":
					result += "CELL CHANGE ORDER FROM UTRAN FAILURE";
					break;

				case "hoToUtranComplete":
					result += "HO TO UTRAN COMPLETE";
					break;

				case "initialDirectTransfer":
					result += "INITIAL DIRECT TRANSFER";
					var patternStr = new RegExp("nas_Message \\'(.{4}).*?\\'H");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += dec_NAS_04_08_MSG_2(msg, matcher[1]);
					}
					break;

				case "handoverFromUtranFailure":
					result += "HANDOVER FROM UTRAN FAILURE";
					break;

				case "measurementControlFailure":
					result += "MEASUREMENT CONTROL FAILURE";
					break;

				case "measurementReport":
					result += "M-REPORT";
					var sentence_sav;

					var patternStr = new RegExp("measurementIdentity (\\w*)");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += ",ID:" + matcher[1] + ",";
					}

					sentence_sav = sentence;
					var patternStr = new RegExp("eventID d_EventID(\\w*)", "g");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += matcher[1];
						var found = 1;
						while (found == 1)
						{
							var patternStr = new RegExp("cellMeasurementEventResults_fdd :.*\\n.*\\n.*primaryScramblingCode (\\d+)", "g");
							var matcher = patternStr.exec(sentence);
							if (void 0 != matcher)
							{
								result += ",SC" + matcher[1] + ',';
								found = 1;
								sentence = sentence.substring(patternStr.lastIndex);
								var found2 = 1;
								while (found2 == 1)
								{
									var patternStr = new RegExp("primaryScramblingCode *(\\d+)", "g");
									var matcher = patternStr.exec(sentence);
									if (void 0 != matcher)
									{
										result += matcher[1] + ",";
										found2 = 1;
										sentence = sentence.substring(patternStr.lastIndex);
									}
									else
									{
										found2 = 0;
									}
								}
							}
							else
							{
								found = 0;
							}
						}
					}
					sentence = sentence_sav;

					var patternStr = new RegExp("measuredResults_[_a-zA-Z]*");	// "measuredResults_(\\p{Lower}.{7})" but \\p is not supported with Javascript
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						var measuredRes = matcher[0].substring(16);
						var index = measuredRes.indexOf( "MeasuredResults");
						if (index != -1)
							measuredRes = measuredRes.substring(0,index);
						result += measuredRes;
						result += ",cells:";
						var  found = 1;
						while (found == 1)
						{
							patternStr = new RegExp("bSICReported_verifiedBSIC : (\\d+)", "g");
							var matcher = patternStr.exec(sentence);
							if (void 0 != matcher)
							{
								result += matcher[1] + ",";
								found = 1;
								sentence = sentence.substring(patternStr.lastIndex);
							}
							else
							{
								patternStr = new RegExp("primaryCPICH_Info.*\\n *primaryScramblingCode *(\\d+)", "g");
								var matcher = patternStr.exec(sentence);
								if (void 0 != matcher)
								{
									//Start This section added by Sean to get ECN0 displayed also
									result += matcher[1];
									found = 1;
									sentence = sentence.substring(patternStr.lastIndex);
									patternStr = new RegExp("cellMeasuredResults_0_0_cpich_Ec_N0 (\\d+)");
									var matcher = patternStr.exec(sentence);
									if (void 0 != matcher)
									{
										var IEVal = 245-((Integer.parseInt(matcher[1])*10)/2); // 25.133 S 9.1.2.3
										var IEValMaj = new Float(IEVal / 10);   //(float)IEVal / 10;
										result += "|-" + IEValMaj + ", ";
									}
									else
									{
										result += ",";
									}
									//End This section added by Sean to get ECNO displayed also
								}
								else
								{
									found = 0;
								}
							}
						}//end of  while (found == 1)
					} //end of if (matchFound)
					sentence = sentence_sav;

					var patternStr = new RegExp("d_TrafficVolumeEventType_e(\\d\\w)");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += " ";
						result += matcher[1];
						break;
					}

					var patternStr = new RegExp("uE_InternalEventResults_event(\\d\\w)");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += " ";
						result += matcher[1];
						break;
					}

					var patternStr = new RegExp("uE_InternalMeasuredResults_0_0_ue_TransmittedPowerFDD (\\d\\w)");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += " TX Pow= ";
						var tx_pow = Integer.valueOf(matcher[1]) - 71;
						result += tx_pow;
						result += " dB";
						break;
					}
					break;

				case "integrityCheckInfo":
					break;

				case "rrcConnectionSetup":
					result += "CONNECTION SETUP" + TYPE_SEP2;
					var patternStr = new RegExp("uarfcn_DL (\\d+)");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += "  DL freq=";
						result += matcher[1];
					}

					var patternStr = new RegExp("TX_DiversityMode_(\\w+)");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += "  TX diver=";
						result += matcher[1];
					}
					var patternStr = new RegExp("srnc_Identity '(\\d+)'B  \\-{2} '(\\w+)'H");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += "  SRNCI=" ;
						result += matcher[2] + "H";
					}

					var patternStr = new RegExp("s_RNTI '(\\d+)'B  \\-{2} '(\\w+)'H");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += "  SRNTI=" ;
						result += matcher[2] + "H";
					}
					break;

				case "cellUpdate":
					result += "CELL UPDATE";
					var patternStr = new RegExp("d_CellUpdateCause_(\\w+) ");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += "   Cause "+ matcher[1];
					}

					var patternStr = new RegExp("srnc_Identity '(\\d+)'B  \\-{2} '(\\w+)'H");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += "  SRNCI=" + matcher[2] + "H";
					}

					var patternStr = new RegExp("s_RNTI '(\\d+)'B  \\-{2} '(\\w+)'H");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += "  SRNTI=" + matcher[2] + "H";
					}
					break;

				case "rrcConnectionRequest":
					result += "RRC CONNECTION REQUEST ";
					var patternStr = new RegExp("d_EstablishmentCause_(\\w+) ");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
						result += matcher[1];
					break;

				case "rrcConnectionReleaseComplete":
					result += "RRC CONNECTION RELEASE COMPLETE";
					break;

				case "rrcConnectionSetupComplete":
					result += "RRC CONNECTION SETUP COMPLETE";
					break;

				case "rrcStatus":
					result += "RRC STATUS";
					break;

				case "securityModeComplete":
					result += "SECURITY MODE COMPLETE";
					break;

				case "securityModeFailure":
					result += "SECURITY MODE FAILURE";
					break;

				case "signalingConnectionReleaseIndication":
					result += "SIGNALLING CONNECTION RELEASE INDICATION";
					break;

				case "transportChannelReconfigurationComplete":
					result += "TRANSPORT CHANNEL RECONFIGURATION COMPLETE";
					break;

				case "transportChannelReconfigurationFailure":
					result += "TRANSPORT CHANNEL RECONFIGURATION FAILURE";
					break;

				case "ueCapabilityInformation":
					result += "UE CAPABILITY INFORMATION";
					break;

				case "uplinkDirectTransfer":
					result += "UPLINK DIRECT TRANSFER";
					var patternStr = new RegExp("nas_Message \\'(.{4}).*?\\'H");
					var matcher = patternStr.exec(sentence);
					if (void 0 != matcher)
					{
						result += dec_NAS_04_08_MSG_2(msg, matcher[1]);
					}
					break;

				case "utranMobilityInformationConfirm":
					result += "UTRAN MOBILITY INFORMATION CONFIRM";
					break;

				case "utranMobilityInformationFailure":
					result += "UTRAN MOBILITY INFORMATION FAILURE";
					break;

				case "activeSetUpdate":
					result += "ACTIVE SET UPDATE";//,  Message Name = " + msg.getUTF8StringValue("_Summary");

					var patternStr = new RegExp("AdditionInformationList.*\\n.*\\n.*\\n.*primaryScramblingCode (\\d+)");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += " A ";
						result += matcher[1];
					}

					// Parse "RemovalInformationList" element
					var patternStr = new RegExp("RemovalInformationList \\{\\s+(\\{\\s+primaryScramblingCode \\d+\\s+(\\}\\,|\\})\\s+){1,8}\\}", "g");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
						{
						result += " R ";
						var startIndex = 0; // matcher.start();	//int
						var endIndex   = patternStr.lastIndex; 	//int
						var subString  = sentence.substring(startIndex, endIndex);
						var foundScrambling = true;
						while( foundScrambling == true )
						{
							var patternStr = new RegExp("primaryScramblingCode (\\d+)", "g");
							var matcher = patternStr.exec( subString );
							if (void 0 != matcher)
							{
								result += matcher[1] + ", ";
								subString = subString.substring(patternStr.lastIndex);
							}
							else
							{
								foundScrambling = false;
								result = result.substring(0, result.length-2);
							}
						}	//end of while( foundScrambling == true )
					} //end  of  if (matchFound)

					var patternStr = new RegExp("tpc_CombinationIndex (\\d+)");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
						result += TYPE_SEP2 + "tpc-CI" + EQUALS + matcher[1];

					var patternStr = new RegExp("timing dTX_DRX_TimingInfo_r7_0_continue");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
						result += TYPE_SEP2 + "(CPC)";
					break;

				case "assistanceDataDelivery":
					result += "ASSISTANCE DATA DELIVERY";
					break;

				case "cellChangeOder":
					result += "CELL CHANGE ORDER";
					var index = sentence.indexOf("ARFCN");
					if(index > 0)
					{
						var endline = sentence.indexOf("\n", index);
						result += " " + sentence.substring(index, endline);
					}
					break;

				case "cellUpdateConfirm":
					result += "CELL UPDATE CONFIRM";
					var patternStr = new RegExp("d_RRC_StateIndicator_(\\w+) ");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += " state ";
						result += matcher[1];
					}
					else
					{
						result += " No state match";
					}
					break;

				case "counterCheck":
					result += "COUNTER CHECK";
					break;

				case "downlinkDirectTransfer":
					result += "DOWNLINK DIRECT TRANSFER";
					var patternStr = new RegExp("nas_Message \\'(.{4}).*?\\'H");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += dec_NAS_04_08_MSG_2(msg, matcher[1]);
					}
					break;

				case "handoverFromUtranCommand":
					result += "HANDOVER FROM UTRAN COMMAND";
					break;

				case "measurementControl":
					result += "M-CTRL,";
					var sentence2;
					var patternStr = new RegExp("measurementType_[_a-zA-Z0-9]*");		// (\\p{Lower}*) Not supported by JavaScript
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						var measuredRes = matcher[0].substring(16);
						var index = measuredRes.indexOf( "FrequencyMeasurement");
						if (index != -1)
							measuredRes = measuredRes.substring(0,index);
						result += measuredRes + ",";
					}

					var patternStr = new RegExp("measurementIdentity (\\d+)");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += "ID:" + matcher[1] + ",";
					}
					else
					{
						result += "No ID";
					}

					var patternStr = new RegExp("measurementCommand_(\\w*)");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += matcher[1] + ",";
					}
					else
					{
						result += "   No match";
					}

					var found = 1;
					sentence2 = sentence;
					while (found == 1)
					{
						var patternStr = new RegExp("primaryScramblingCode (\\d*)", "g");
						var matcher = patternStr.exec( sentence2 );
						if (void 0 != matcher)
						{
							result += matcher[1] + ",";
							sentence2 = sentence2.substring(patternStr.lastIndex);
						}
						else
						{
							found = 0;
						}
					}

					found = 1;
					sentence2 = sentence;
					while (found == 1)
					{
						var patternStr = new RegExp("usedFreqThreshold -(\\d*)", "g");
						var matcher = patternStr.exec( sentence2 );
						if (void 0 != matcher)
						{
							result += "Th -" + matcher[1] +  " ";
							sentence2 = sentence2.substring(patternStr.lastIndex);
							var patternStr = new RegExp("hysteresis (\\d*),");
							var matcher = patternStr.exec( sentence2 );
							if (void 0 != matcher)
							{
								result += "H " + matcher[1] +  ", ";
							}
						}
						else
						{
							found = 0;
						}
					}

					var patternStr = new RegExp("d_ReportingIntervalLong_ril(\\w*)");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += "periodic:" + matcher[1] + "s,";
					}

					var found = 1;
					while (found == 1)
					{
						var patternStr = new RegExp("Event_(\\w*)", "g");
						var matcher = patternStr.exec( sentence2 );
						if (void 0 != matcher)
						{
							result += matcher[1] + ",";
							sentence2 = sentence2.substring(patternStr.lastIndex);
						}
						else
						{
							found = 0;
						}
					}

					var patternStr = new RegExp("d_FilterCoefficient_fc(\\w{1})");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += "FC:" + matcher[1] + ",";
					}

					var index_compressedMode = sentence.indexOf("CompressedModeStatusInfo");
					if( index_compressedMode != -1 )
					{
						result += "CM info present,";
						var no_tgpsi = 1;

						do
						{
							var tgpsi      = "tgpsi " + no_tgpsi;
							var tgpsi_next = "tgpsi " + (no_tgpsi+1);

							var index_tgpsi      = sentence.indexOf(tgpsi, index_compressedMode);
							var index_tgpsi_next = sentence.indexOf(tgpsi_next, index_tgpsi);

							if( index_tgpsi != -1 )
							{
								var tgpsi_element = "";

								if( index_tgpsi_next != -1 )
									tgpsi_element = sentence.substring(index_tgpsi, index_tgpsi_next);
								else
									tgpsi_element = sentence.substring(index_tgpsi);

									// Parse tgps_Status
								var patternStr = new RegExp("tgps_Status (.+) :");
								var matcher = patternStr.exec( sentence );
								if (void 0 != matcher)
								{
									var matchedStr = matcher[1];
									if( matchedStr.equals("tGP_SequenceShort_0_activate") )
										result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Activate";
									else if( matchedStr.equals("tGP_SequenceShort_0_deactivate") )
										result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Deactivate";
								}
							} // end: if( index_tgpsi != -1 )

							no_tgpsi++;
						} while( no_tgpsi <= 6 );
					}
					break;

				case "pagingType2":
					result += "PAGING TYPE 2";
					break;

				case "physicalChannelReconfiguration":
					result += "PHYSICAL CHANNEL RECONFIGURATION";
					result += decode_reconfig( msg );

					var index_compressedMode = sentence.indexOf("dpch_CompressedModeInfo");
					 if( index_compressedMode != -1 )
					{
						var no_tgpsi = 1;

						do
						{
							var tgpsi      = "tgpsi " + no_tgpsi;
							var tgpsi_next = "tgpsi " + (no_tgpsi+1);

							var index_tgpsi      = sentence.indexOf(tgpsi, index_compressedMode);
							var index_tgpsi_next = sentence.indexOf(tgpsi_next, index_tgpsi);

							if( index_tgpsi != -1 )
							{
								var tgpsi_element = "";

								if( index_tgpsi_next != -1 )
									tgpsi_element = sentence.substring(index_tgpsi, index_tgpsi_next);
								else
									tgpsi_element = sentence.substring(index_tgpsi);

								// Parse tgps_Status
								var patternStr = new RegExp("tgps_Status (.+) :");
								var matcher = patternStr.exec( sentence );
								if (void 0 != matcher)
								{
									var matchedStr = matcher[1];
									if( matchedStr.equals("tGP_Sequence_0_activate") )
										result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Activate";
									else if( matchedStr.equals("tGP_Sequence_0_deactivate") )
										result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Deactivate";
								}

								// Parse tgmp
								var patternStr = new RegExp("tgmp (.+)  --");
								var matcher = patternStr.exec( sentence );
								if (void 0 != matcher)
								{
									var matchedStr = matcher[1];
									if( matchedStr.equals("d_TGMP_gsm_initialBSICIdentification") )
										result += "/BSICIdentification";
									else if( matchedStr.equals("d_TGMP_gsmBSICReconfirmation") )
										result += "/BSICReconfirmation";
									else if( matchedStr.equals("d_TGMP_gsm_CarrierRSSIMeasurement") )
										result += "/CarrierRSSIMeasurement";
								}
							} // end: if( index_tgpsi != -1 )

							no_tgpsi++;
						} while( no_tgpsi <= 6 );
					}
					break;

				case "physicalChannelReconfigurationComplete":
					result += "PHYSICAL CHANNEL RECONFIGURATION COMPLETE";
					break;

				case "radioBearerReconfiguration":
					result += "RADIO BEARER RECONFIGURATION";
					result += decode_reconfig( msg );
					if (!IsEmpty(sentence))
					{
						var index_compressedMode = sentence.indexOf("dpch_CompressedModeInfo");
						if( index_compressedMode != -1 )
						{
							var no_tgpsi = 1;

							do
							{
								var tgpsi      = "tgpsi " + no_tgpsi;
								var tgpsi_next = "tgpsi " + (no_tgpsi+1);

								var index_tgpsi      = sentence.indexOf(tgpsi, index_compressedMode);
								var index_tgpsi_next = sentence.indexOf(tgpsi_next, index_tgpsi);

								if( index_tgpsi != -1 )
								{
									var tgpsi_element = "";

									if( index_tgpsi_next != -1 )
										tgpsi_element = sentence.substring(index_tgpsi, index_tgpsi_next);
									else
										tgpsi_element = sentence.substring(index_tgpsi);

										// Parse tgps_Status
									var patternStr = new RegExp("tgps_Status (.+) :");
									var matcher = patternStr.exec( sentence );
									if (void 0 != matcher)
									{
										var matchedStr = matcher[1];
										if( matchedStr.equals("tGP_Sequence_0_activate") )
											result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Activate";
										else if( matchedStr.equals("tGP_Sequence_0_deactivate") )
											result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Deactivate";
									}

									// Parse tgmp
									var patternStr = new RegExp("tgmp (.+)  --");
									var matcher = patternStr.exec( sentence );
									if (void 0 != matcher)
									{
										var matchedStr = matcher[1];
										if( matchedStr.equals("d_TGMP_gsm_initialBSICIdentification") )
											result += "/BSICIdentification";
										else if( matchedStr.equals("d_TGMP_gsmBSICReconfirmation") )
											result += "/BSICReconfirmation";
										else if( matchedStr.equals("d_TGMP_gsm_CarrierRSSIMeasurement") )
											result += "/CarrierRSSIMeasurement";
									}
								} // end: if( index_tgpsi != -1 )

								no_tgpsi++;
							} while( no_tgpsi <= 6 );
						}
					}
					break;

				case "radioBearerReconfigurationComplete":
					result += "RADIO BEARER RECONFIGURATION COMPLETE";
				break;

				case "radioBearerRelease":
					result += "RADIO BEARER RELEASE";
				break;

				case "radioBearerSetup":
					result += "RADIO BEARER SETUP";
					result += decode_reconfig( msg );

					if (!IsEmpty(sentence))
					{
						var index_compressedMode = sentence.indexOf("dpch_CompressedModeInfo");
						if( index_compressedMode != -1 )
						{
							var no_tgpsi = 1;

							do
							{
								var tgpsi      = "tgpsi " + no_tgpsi;
								var tgpsi_next = "tgpsi " + (no_tgpsi+1);

								var index_tgpsi      = sentence.indexOf(tgpsi, index_compressedMode);
								var index_tgpsi_next = sentence.indexOf(tgpsi_next, index_tgpsi);

								if( index_tgpsi != -1 )
								{
									var tgpsi_element = "";

									if( index_tgpsi_next != -1 )
										tgpsi_element = sentence.substring(index_tgpsi, index_tgpsi_next);
									else
										tgpsi_element = sentence.substring(index_tgpsi);

									// Parse tgps_Status
									var patternStr = new RegExp("tgps_Status (.+) :");
									var matcher = patternStr.exec( sentence );
									if (void 0 != matcher)
									{
										var matchedStr = matcher[1];
										if( matchedStr.equals("tGP_Sequence_0_activate") )
											result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Activate";
										else if( matchedStr.equals("tGP_Sequence_0_deactivate") )
											result += TYPE_SEP2 + tgpsi + VALUE_SEP + "Status=Deactivate";
									}

									// Parse tgmp
									var patternStr = new RegExp("tgmp (.+)  --");
									var matcher = patternStr.exec( sentence );
									if (void 0 != matcher)
									{
										var matchedStr = matcher[1];
										if( matchedStr.equals("d_TGMP_gsm_initialBSICIdentification") )
											result += "/BSICIdentification";
										else if( matchedStr.equals("d_TGMP_gsmBSICReconfirmation") )
											result += "/BSICReconfirmation";
										else if( matchedStr.equals("d_TGMP_gsm_CarrierRSSIMeasurement") )
											result += "/CarrierRSSIMeasurement";
									}
								} // end: if( index_tgpsi != -1 )

								no_tgpsi++;
							} while( no_tgpsi <= 6 );
						}
					}
					break;

				case "radioBearerSetupComplete":
					result += "RADIO BEARER SETUP COMPLETE";
					break;

				case "rrcConnectionRelease":
					result += "RRC CONNECTION RELEASE";
					var patternStr = new RegExp("d_ReleaseCause_(\\w+) ");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result += " cause ";
						result += matcher[1];
					}
					else
					{
						result += " No state match";
					}
					break;

				case "securityModeCommand":
					result += "SECURITY MODE COMMAND";
					var patternStr = new RegExp("cn_DomainIdentity d_CN_DomainIdentity_ps_domain");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result+=" (PS)";
					}

					var patternStr = new RegExp("cn_DomainIdentity d_CN_DomainIdentity_cs_domain");
					var matcher = patternStr.exec( sentence );
					if (void 0 != matcher)
					{
						result+=" (CS)";
					}
					break;

				case "signallingConnectionRelease":
					result += "SIGNALLING CONNECTION RELEASE";
					break;

				case "signallingConnectionReleaseIndication":
					result += "SIGNALLING CONNECTION RELEASE INDCATION";
					break;

				case "transportChannelReconfiguration":
					result += "TRANSPORT CHANNEL RECONFIGURATION";
					result += decode_reconfig( msg );
					break;

				case "transportFormatCombinationControl":
					result += "TRANSPORT FORMAT COMBINATION CONTROL";
					break;

				case "ueCapabilityEnquiry":
					result += "UE CAPABILITY ENQUIRY";
					break;

				case "ueCapabilityInformationConfirm":
					result += "UE CAPABILITY INFORMATION CONFIRM";
					break;

				case "uplinkPhysicalChannelControl":
					result += "UPLINK PHYSICAL CHANNEL CONTROL";
					break;

				case "uraUpdateConfirm":
					result += "URA UPDATE CONFIRM";
					break;

				case "utranMobilityInformation":
					result += "UTRAN MOBILITY INFORMATION";
					break;

				default:
					result += MessageName + TYPE_SEP2;
logMessage("Default=["+MessageName+"]");
					break;
				}

			}
		}

		/*
		logMessage( "ASN1_BracketCount   ="+myASN1_Obj.ASN1_BracketCount);
		logMessage( "ASN1_BracketSum     ="+myASN1_Obj.ASN1_BracketSum);
		logMessage( "ASN1_BracketMember  ="+myASN1_Obj.ASN1_BracketMember);
		logMessage( "ASN1_Title      ="+myASN1_Obj.ASN1_Title);
		for (i = 0; i < myASN1_Obj.ASN1_BracketMember; i++)
			logMessage( "ASN_Members["+i+"]="+myASN1_Obj.ASN_Members[i]);
		*/

	} catch(e) {
		logException( e );
	}
	return result;
}

/////////////////////////////////////////
function dec_NAS_04_08_MSG_2(msg, bytes)	//String bytes
{
	var result = "   ";

	var pd = Integer.parseInt(bytes.substring(0, 2),16);       //HexString -> int
	var msg_type = Integer.parseInt(bytes.substring(2, 4),16); //HexString -> int
	pd = pd & 0x0F;

	switch (pd)
	{
		case 3:  // call control; call related SS messages
			msg_type = msg_type & 0x3F;
			result += cc_crss_msg_type(msg_type);
			break;
		case 4:  // GPRS Transparent Transport Protocol (GTTP)
			msg_type = msg_type & 0x3F;
			result += gttp_msg_type(msg_type);
			break;
		case 5:  // mobility management messages
			msg_type = msg_type & 0x3F;
			result += mm_non_gprs_msg_type(msg_type);
			break;
		case 6:  // radio resources management messages
			msg_type = msg_type & 0x3F;
			result += rr_msg_type(msg_type);
			break;
		case 8:  // GPRS mobility management messages
			msg_type = msg_type & 0x3F;
			result += gmm_msg(msg, msg_type);
			break;
		case 9:  // SMS messages
			msg_type = msg_type & 0x3F;
			result += sms_msg_type(msg_type);
			break;
		case 10: // GPRS session management messages
			msg_type = msg_type & 0x7F;
			result += sm_msg_type(msg_type);
			break;
		case 11: // non call related SS messages
			msg_type = msg_type & 0x3F;
			result += ncr_ss_type(msg_type);
			break;
		case 15: // Test Loop messages
			result += "Test Loop message";
			break;
		default:
			result = "   UnDecoded Msg " + pd;
	}

	return result;
}
////////////////////////////////////////////

/**
 * Function to decode the bearer assigned in a reconfiguration
 * Author Carlo F
 * Does only a best guess!! It's not doing the real thing, which would be the ASN1
 * decoding
 * Date 16.08.05
 *
 * @param -
 * @return RRC Freq & SC responded to DC
 */

function decode_reconfig( msg )
{
	var result = "";

	var decoding = "";
	try {
		decoding = new String(service.getDecodedStructValue(PanelLG, msg, "Derefrenced Pointer Data", "Pointer_0 : ASN1 Message"));
	} catch(e) {
		logException( e );
		decoding = "";
	}
	var patternStr = new RegExp("d_RRC_StateIndicator_(\\w+) ");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " state ";
		result += matcher[1];
		if (matcher[1].equals("cell_FACH")){
			return result;
		}
	}
	else
	{
		result += " No state match";
	}

	// Look for InterFreq reconfiguration
	var patternStr = new RegExp("uarfcn_DL (\\d+)");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " Freq ";
		result += matcher[1];
	}
	// End InterFreq reconfig

	// UDI video call
	var patternStr = new RegExp("octetModeRLC_SizeInfoType1_sizeType2 : .*\\n.*part1 11,.*\\n.*part2 2");
	// OK, this is quite rough, but it seems to work
	// so far I have not seen any other reocnfig using this
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " CS Data 64/64";
		return result;
	}
	// UDI

	var patternStr = new RegExp("primaryScramblingCode (\\d+)\\n +\\},\\n +servingHSDSCH_RL_indicator TRUE");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " scell=" + matcher[1];
	}

	var patternStr = new RegExp("IEs_dl_SecondaryCellInfoFDD dL_SecondaryCellInfoFDD_");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " (DC_On)";
	} else
	{
		result += " (DC_Off)";
	}

	// radioBearerReconfiguration_r7_IEs_dtx_drx_TimingInfo
	var patternStr = new RegExp("IEs_dtx_drx_TimingInfo");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " (CPC_On)";
	}
	else
	{
		result += " (CPC_Off)";
		//fdpch_FrameOffset
		var patternStr = new RegExp("fdpch_FrameOffset");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " F-DPCH";
		}
	}

	//dL_HSPDSCH_Information_r7_0_1_dl_64QAM_Configured d_DL_HSPDSCH_Information_r7_0_1_0_true
	//var patternStr = new RegExp("64QAM_Configured d_DL_HSPDSCH_Information_r7_0_1_0_true ");
	var patternStr = new RegExp("64QAM_Configured d_DL_HSPDSCH_Information_r[7|8]_0_1_0_true ");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " 64QAM";
	}

	//Information_slot_format_4
	var patternStr = new RegExp("Information_slot_format_4");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " UL_Slot4";
	}

	// 16QAM_Settings
	patternStr = new RegExp("16QAM_Settings");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " UL16QAM";
	}

	 // mac i/is
	patternStr = new RegExp("mac_iis");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " mac i/is";
	}

	// scch_LessInfo
	patternStr = new RegExp("scch_LessInfo");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " scchLess";
	}

	// scch_LessInfo
	patternStr = new RegExp("scch_LessInfo");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
	result += " scchLess";
	}

	// HSUPA
	var patternStr = new RegExp("uL_AddReconfTransChInformation_r\\d_e_dch");
	var matcher = patternStr.exec( decoding );
	if (void 0 != matcher)
	{
		result += " UL HSUPA";
		patternStr = new RegExp("tti d_E_DCH_TTI_tti10");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " TT1=10ms";
		}
		patternStr = new RegExp("tti d_E_DCH_TTI_tti2");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " TT1=2ms";
		}
		return result;
	}
	// end HSUPA

	//start WB AMR
	var wbAmrFlag=false;
	var patternStr = "small : ";
	var division = decoding.split(patternStr);		//String[] type
	if (division.length == 1) // No small: this is not a real PS reconfiguration
	{
		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 81");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " Voice (12.2 NB)";
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 53");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " NB AMR 4.75";
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 49");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " NB AMR 5.15";
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 63");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " NB AMR 5.9";
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 76");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " NB AMR 6.7";
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 87");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " NB AMR 7.4";
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 84");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " NB AMR 7.95";
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 99");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " NB AMR 10.2";
			wbAmrFlag=true;
			//return result;
		}

		  //6.60=78, 8.85=113,
		var patternStr = new RegExp( "bitModeRLC_SizeInfo_sizeType1 : 78");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " WB AMR 6.6";//6.6
			//System.out.println("78+++++++++++++++"+result);
			wbAmrFlag=true;
			//return result;
		}

		var patternStr = new RegExp("bitModeRLC_SizeInfo_sizeType1 : 113");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			result += " WB AMR 8.85";
			wbAmrFlag=true;
			//return result;
		}

		/* To find bitModeRLC_SizeInfo_sizeType2 */
		/* Created By :Prabhakaran S.*/
		var sizeTypeTwo = new RegExp("bitModeRLC_SizeInfo_sizeType2");
		var matcher = sizeTypeTwo.exec( decoding );
		if (void 0 != matcher)
		{
			var partOne = "part1";
			var partTwo = "part2";
			var bit=8;
			var sizeTypeTwointeger=128;
			var temp ="";
			if(!IsEmpty(decoding))
				temp = sizeTypeFinder(decoding,sizeTypeTwo,partOne,partTwo,bit,sizeTypeTwointeger);
			result += temp;
			if(!temp.equals(""))
				wbAmrFlag=true;
		}

		/* To find bitModeRLC_SizeInfo_sizeType3 */
		/* Created By :Prabhakaran S.*/
		var sizeTypeThree = new RegExp("bitModeRLC_SizeInfo_sizeType3");
		var matcher = sizeTypeThree.exec( decoding );
		if (void 0 != matcher)
		{
			var partOne = "part1";
			var partTwo = "part2";
			var bit=16;
			var sizeTypeThreeInteger=256;
			var temp ="";
			if(!IsEmpty(decoding))
				temp = sizeTypeFinder(decoding,sizeTypeThree,partOne,partTwo,bit,sizeTypeThreeInteger);
			result += temp;
			if(!temp.equals(""))
				wbAmrFlag=true;
		}

		if(wbAmrFlag)
		{
			return result;
		}
		//End WB AMR

		var patternStr = "small : ";
		var division = decoding.split(patternStr); //String[]
		if (division.length == 1) // No small: Can not find a 336 PS TB
		{
			var patternStr = new RegExp("part1 2\\n +\\},\\n +numberOfTbSizeList \\{\\n +numberOfTransportBlocks_zero : NULL\\n +\\}"); // this would be only 0 TB with size 336 --> assuming 0-0 configuration
			var matcher = patternStr.exec( decoding );
			if (void 0 != matcher)
			{
				result += " 0-0 Bearer"; // 0-0 state
			}
		}
	}//end of (division.length == 1)
	else
	{
		// this is a PS reconfig
		var patternStr = new RegExp("dl_AddReconfTransChInfoList");
		var DL_reconfig = patternStr.test( decoding );		//Boolean wrapper class
		var patternStr = new RegExp("ul_AddReconfTransChInfoList");
		var UL_reconfig = patternStr.test( decoding );		//Boolean wrapper class

		if (DL_reconfig && UL_reconfig)
		{ // reconfiguring both
			var patternStr = "dl_AddReconfTransChInfoList"; // to split UL and DL
			var UL_DL = decoding.split(patternStr); // divide UL and DL  // String[] type
			var UL = "";
			var DL = "";
			var patternStr = new RegExp("dl_HSPDSCH_Information");
			var matcher = patternStr.exec( UL_DL[1] );
			if (void 0 != matcher)
			{
				UL = UL_DL[0];
				result += "; UL ";
				result += find_PS_bearer(UL);
				result += ", DL HSDPA";
				return result;
			}

			var patternStr = new RegExp("sameAsULTrCH");
			var matcher = patternStr.exec( decoding );
			if (void 0 != matcher && (find_PS_bearer(UL_DL[1]).equals("")))
			{
				UL = UL_DL[0];
				DL = UL_DL[0];
			}
			else
			{
				UL = UL_DL[0];
				DL = UL_DL[1];
			}

			result += "; UL ";
			if (find_PS_bearer(UL).equals(""))
			{
				result += "No change";
			}
			else
			{
				result += find_PS_bearer(UL);
			}

			result += ", DL ";
			if (find_PS_bearer(DL).equals(""))
			{
				result += "No change";
			}
			else
			{
				result += find_PS_bearer(DL);
			}
		}  // end reconfig both
		else if (DL_reconfig)
		{ // DL only
			var patternStr = new RegExp("dl_HSPDSCH_Information"); // checking for HSDPA
			var matcher = patternStr.exec( decoding );
			if (void 0 != matcher)
			{
				result += "; UL no Change ";
				result += ", DL HSDPA";
				return result;
			}

			result += "; UL no Change , DL ";
			result += find_PS_bearer(decoding);
			return result;
		}  // End DL only
		else if (UL_reconfig)
		{ // UL only
			result += "; UL ";
			result += find_PS_bearer(decoding);
			result += ", DL no Change";
			return result;
		}
	} //end of else for  // this is a PS reconfig
	return result;
}

////////////////////////////////////////////////
function find_PS_bearer(reconf)  //String type reconf
{
	var result = "";
//logMessage("find_PS_bearer reconf="+reconf);

	// figure out the last tti
	var tti = 20; // Default

	//var patternStr = new RegExp("dedicatedTransChTFS_0_tti(\\d+)((\\s).*)dedicatedTransChTFS_0_tti(\\d+)"); // first find the PS, not the signalling TrCh
	var patternStr = new RegExp("dedicatedTransChTFS_0_tti(\\d+)((.|\\n)*)dedicatedTransChTFS_0_tti(\\d+)"); // first find the PS, not the signalling TrCh
//	logMessage( "PATTERN:"+patternStr);
	var matcher = patternStr.exec( reconf );
	if (void 0 != matcher)
	{
//		logMessage( "FOUND:"+matcher.length);
//		logMessage( "FOUND 1:"+ matcher[1]);
//		logMessage( "FOUND 2:"+ matcher[2]);
//		logMessage( "FOUND 3:"+ matcher[3]);
//		logMessage( "FOUND 4:"+ matcher[4]);
		tti = matcher[matcher.length-1];
		//result += "tti = " + matcher[3];
	}
	else
	{
		patternStr = new RegExp("dedicatedTransChTFS_0_tti(\\d+)((\\s).*)small : ");
		var matcher = patternStr.exec( reconf );
		if (void 0 != matcher)
		{
			tti = Integer.valueOf(matcher[1]);
		}
		else
		{
			patternStr = new RegExp("dedicatedTransChTFS_0_tti(\\d+)");
			var matcher = patternStr.exec( reconf );
			if (void 0 != matcher)
			{
				tti = Integer.valueOf(matcher[1]);
			}
		}
	}
//logMessage( "find_PS_bearer tti="+tti);

	// figure out the biggest TF available
	var patternStr = "small : ";
	var division = reconf.split(patternStr); //String[]
	var last_tfc = division[division.length - 1].substring(0, 2);
	var patternStr = new RegExp("(\\d+)");
	var matcher = patternStr.exec( last_tfc );
	if (void 0 != matcher)
	{
		var gpInfo = matcher[1];
		if("2".equals(gpInfo)) {
			result += 32 * 20/tti;
		}
		else if("4".equals(gpInfo)) {
			result += 64 * 20/tti;
		}
		else if("8".equals(gpInfo)) {
			result += 128 * 20/tti;
		}
		else if("12".equals(gpInfo)) {
			result += 384 * 10/tti;
		}
		else {
			result += "Unknown tfc";
		}
		/*switch (matcher[1])
		{
		case "2":
			result += 32 * 20/tti;
			break;
		case "4":
			result += 64 * 20/tti;
			break;
		case "8":
			result += 128 * 20/tti;
			break;
		case "12":
			result += 384 * 10/tti;
			break;
		default:
			result += "Unknown tfc";
			break;
		}*/
	}
	else
	{
		var patternStr = new RegExp("octetModeRLC_SizeInfoType1_sizeType2((\\s).*)numberOfTransportBlocks_zero : NULL((\\s).*)numberOfTransportBlocks_one : NULL"); // Only one TB, for the 16 or 8 configurations
		var matcher = patternStr.exec( reconf );
		if (void 0 != matcher)
		{
			result += 16 * 20/tti;  // at least on TB
		}
	}

//logMessage("find_PS_bearer result="+result);
	return result;
} //end of find_PS_bearer

/////////////////////////////////////////
/**
 * ncr_ss_type : Submethod that returns the message type of "non call related SS messages"
 */
function ncr_ss_type(msg_type)
{
	var res = UNKNOWN_TYPE;
	switch (msg_type)
	{
	case 42:
		res = "RELEASE COMPLETE";
		break;
	case 58:
		res = "FACILITY";
		break;
	case 59:
		res = "REGISTER";
		break;
	}
	return res;
} // end of method "ncr_ss_type"

////////////////////////////////////////////
/**
 * sm_msg_type : Submethod that returns the message type of an SM message
 */
function sm_msg_type(msg_type)
{
	var res = UNKNOWN_TYPE + " type = " + msg_type;
	switch (msg_type)
	{
	case 65:
		res = "Activate PDP Context Request";
		break;
	case 66:
		res = "Activate PDP Context Accept";
		break;
	case 67:
		res = "Activate PDP Context Reject";
		break;
	case 68:
		res = "Request PDP Context Activation";
		break;
	case 69:
		res = "Request PDP Context Activation Reject";
		break;
	case 70:
		res = "Deactivate PDP Context Request";
		break;
	case 71:
		res = "Deactivate PDP Context Accept";
		break;
	case 72:
		res = "Modify PDP Context Request";
		break;
	case 73:
		res = "Modify PDP Context Accept";
		break;
	case 77:
		res = "Activate Secondary PDP Context Request";
		break;
	case 78:
		res = "Activate Secondary PDP Context Accept";
		break;
	case 79:
		res = "Activate Secondary PDP Context Reject";
		break;
	case 80:
		res = "Activate AA PDP Context Request";
		break;
	case 81:
		res = "Activate AA PDP Context Accept";
		break;
	case 82:
		res = "Activate AA PDP Context Reject";
		break;
	case 83:
		res = "Decativate AA PDP Context Request";
		break;
	case 84:
		res = "Decativate AA PDP Context Accept";
		break;
	case 85:
		res = "SM Status";
		break;
	}
	return res;
} // end of method "sm_msg_type"
////////////////////////////////////////////
/*
 * sms_msg : Submethod that returns the message type of a SMS message Predrag
 */
function sms_msg_type(msg_type)
{
	var res = UNKNOWN_TYPE;

	switch (msg_type)
	{
	case 1:
		res = "SMS CP Data"; // (SMS CP Data)";
		break;
	case 4:
		res = "SMS CP Ack"; // (SMS CP Ack)";
		break;
	case 16:
		res = "SMS Error"; // (SMS Error)";
		break;
	default:
		res = "UnDecoded Msg " + msg_type;
	}
	return res;
} // end of method "sms_msg_type"
/////////////////////////////////////////////

/**
 * gmm_msg : Submethod that returns the message type of a GMM message
 */
function gmm_msg(msg, msg_type)
{
	var res = UNKNOWN_TYPE + "type = " + msg_type;

	switch (msg_type)
	{
	case 1:
		res = "Attach Request"; // (Attach Request)";
		break;
	case 2:
		res = "Attach Accept"; // (Attach Accept)";
		break;
	case 3:
		res = "Attach Complete"; // (Attach Complete)";
		break;
	case 4:
		res = "Attach Reject"; // (Attach Reject)";
		break;
	case 5:
		res = "Detach Request"; // (Detach Request)";
		break;
	case 6:
		res = "Detach Accept"; // (Detach Accept)";
		break;
	case 8:
		res = "Routing Area Update Request"; // (Routing Area Update Request)";
		break;
	case 9:
		res = "Routing Area Update Accept"; // (Routing Area Update Accept)";
		var decoding = "";
		try {
			decoding = new String(service.getDecodedStructValue(PanelLG, msg, "Derefrenced Pointer Data", "Pointer_0 : ASN1 Message"));
		} catch(e) {
			logException( e );
			decoding = "";
		}
		var patternStr = new RegExp("(\\d+) decihours");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
		res += "; T3312=";
		res += matcher[1];
		}
		break;
	case 10:
		res = "Routing Area Update Complete"; // (Routing Area Updat Complete)";
		break;
	case 11:
		res = "Routing Area Update Reject"; // (Routing Area Update Reject)";
		var decoding = "";
		try {
			decoding = new String(service.getDecodedStructValue(PanelLG, msg, "Derefrenced Pointer Data", "Pointer_0 : ASN1 Message"));
		} catch(e) {
			logException( e );
			decoding = "";
		}
		var patternStr =  new RegExp("[cC]ause value[ ]*\\: ([a-zA-Z ]*) \\:");
		var matcher = patternStr.exec( decoding );
		if (void 0 != matcher)
		{
			res += TYPE_SEP2 + "Cause: " + matcher[1];
		}
		break;
	case 12:
		res = "Service Request";
		break;
	case 13:
		res = "Service Accept";
		break;
	case 14:
		res = "Service Reject"; // (Routing Area Update Reject)";
		break;
	case 16:
		res = "P-TMSI reallocation command"; // (P-TMSI reallocation command)";
		break;
	case 17:
		res = "P-TMSI reallocation complete"; // (P-TNSI reallocation complete)";
		break;
	case 18:
		res = "Authentication and Ciphering Request"; // (Authentication and Ciphering Request)";
		break;
	case 19:
		res = "Authentication and Ciphering Response"; // (Authentication and Ciphering Response)";
		break;
	case 20:
		res = "Authentication and Ciphering Reject"; // (Authentication and Ciphering Reject)";
		break;
	case 21:
		res = "Identity Request"; // (Identity Request)";
		break;
	case 22:
		res = "Identity Response"; // (Identity Response)";
		break;
	case 28:
		res = "Authentication and Ciphering Failure"; // (Authentication and Ciphering Failure)";
		break;
	case 32:
		res = "GMM Status"; // (GMM Status)";
		break;
	case 33:
		res = "GMM Information"; // (GMM Information)";
		break;
	default:
		res += msg_type;
		break;
	}
	return res;
}

////////////////////////////
/**
 * cc_crss_msg_type : Submethod that returns the message type of a CC message
 */
function cc_crss_msg_type(msg_type)
{
	var res = UNKNOWN_TYPE + "type = " + msg_type;
	switch (msg_type)
	{
	case 1:
		res = "Alerting";
		break;
	case 8:
		res = "Call Confirmed";
		break;
	case 2:
		res = "Call Proceeding";
		break;
	case 7:
		res = "Connect";
		break;
	case 15:
		res = "Connect Acknowledge";
		break;
	case 14:
		res = "Emergency Setup";
		break;
	case 3:
		res = "Progress";
		break;
	case 4:
		res = "CC Establishment";
		break;
	case 6:
		res = "CC Establishment Confirmed";
		break;
	case 11:
		res = "Recall";
		break;
	case 9:
		res = "Start CC";
		break;
	case 5:
		res = "Setup";
		break;
	case 23:
		res = "Modify";
		break;
	case 31:
		res = "Modify Complete";
		break;
	case 19:
		res = "Modify Reject";
		break;
	case 16:
		res = "User Information";
		break;
	case 24:
		res = "Hold";
		break;
	case 25:
		res = "Hold Acknowledge";
		break;
	case 26:
		res = "Hold Reject";
		break;
	case 28:
		res = "Retrieve";
		break;
	case 29:
		res = "Retrieve Acknowledge";
		break;
	case 39:
		res = "Retrieve Reject";
		break;
	case 37:
		res = "Disconnect";
		break;
	case 45:
		res = "Release";
		break;
	case 42:
		res = "Release Complete";
		break;
	case 57:
		res = "Congestion Control";
		break;
	case 62:
		res = "Notify";
		break;
	case 61:
		res = "Status";
		break;
	case 52:
		res = "Status Enquiry";
		break;
	case 53:
		res = "Start DTMF";
		break;
	case 49:
		res = "Stop DTMF";
		break;
	case 50:
		res = "Stop DTMF Acknowledge";
		break;
	case 54:
		res = "Start DTMF Acknowledge";
		break;
	case 55:
		res = "Start DTMF Reject";
		break;
	case 58:
		res = "Facility";
		break;
	}
	return res;
}

function dec_LLT_L1_PCKD_PDTCH_TX_HEADER( iStream )
{
	var result = "";

	try
	{
		if (iStream.available() == 14)
			{
			var iTemp;
			var header = new Array(8); //int [] header = new Int[8];
			var blockformat = -1;

			// read blockformat
			iTemp = iStream.readUnsignedShort(); // word 0
			blockformat = ((iTemp & 0xff00) >> 8) | ((iTemp & 0x00ff) << 8);

			// check blockformat
			switch (blockformat)
			{
			case 0x00: // CS-1
			case 0x01: // CS-2
			case 0x02: // CS-3
			case 0x03: // CS-4
				{
				for (var i = 1, j = 0; i < 5; i++) // word 1 .. 4
				{
					iTemp = iStream.readUnsignedShort();
					header[j++] = (iTemp & 0xFF00) >> 8;
					header[j++] = (iTemp & 0x00ff);
				}

				var pt = ((header[0] & 0xC0) >> 6);
				if (pt == 0x00)
				{
					var cv = ((header[0] & 0x3C) >> 2);
					var si = ((header[0] & 0x02) >> 1);
					var r = ((header[0] & 0x01));
					var pi = ((header[1] & 0x40) >> 6);
					var tfi = ((header[1] & 0x3e) >> 1);
					var ti = ((header[1] & 0x01));
					var bsn = ((header[2] & 0xFE) >> 1);
					var e = ((header[2] & 0x01));

					result = "BSN:" + bsn + ", " + "CV:" + cv + ", " + "TFI:" + tfi + ", " + "E:" + e;
				}
				else
				{
					result = "UL Block is not a RLC Data Block (PT: " + pt + ")";
				}
				}
			break;

			case 0x04: // PACCH (PRACH 8 Bit)
				{
				result = "PACCH (PRACH 8 Bit)";
				}
			break;

			case 0x05: // PACCH (PRACH 11 Bit)
				{
				result = "PACCH (PRACH 11 Bit)";
				}
			break;

			case 0x0100: //MCS-1
			case 0x0110: //MCS-2
			case 0x0120: //MCS-3
			case 0x0130: //MCS-4
				{
				iTemp = iStream.readUnsignedShort(); // word 1
				var ps1 = ((iTemp & 0xff00) >> 8) | ((iTemp & 0x00ff) << 8);
				iTemp = iStream.readUnsignedShort(); // word 2

				if ((ps1 >= 0) && (ps1 <= 2))
				{
					for (var i = 3, j = 0; i < 7; i++) // word 3 .. 6
					{
						iTemp = iStream.readUnsignedShort();
						header[j++] = (iTemp & 0xFF00) >> 8;
						header[j++] = (iTemp & 0x00ff);
					}

					// get elements from header independent on header type
					var tfi = ((header[0] & 0xC0) >> 6) | ((header[1] & 0x07) << 2);
					var cv = ((header[0] & 0x3C) >> 2);
					var si = ((header[0] & 0x02) >> 1);
					var r = ((header[0] & 0x01) >> 0);
					var bsn = ((header[1] & 0xF8) >> 3) | ((header[2] & 0x3F) << 5);

					var pi = ((header[3] & 0x20) >> 5);
					var cps = ((header[2] & 0xC0) >> 6) | ((header[3] & 0x03) << 2);
					var cpsStr = decodeCPS_H3(cps);

					result = "BSN:" + bsn + ", " + "CPS:" + cpsStr + "(" + cps + ")"
								+ ", " + "CV:" + cv + ", " + "TFI:" + tfi + ", " + "SI:" + si
								+ ", " + "R:" + r + ", " + "PI:" + pi;
				}
				else
				{
					result = "Unknown PS (" + ps1 + ") for Blockformat ("
								+ blockformat + ")";
				}
				}
			break;

			case 0x0340: //MCS-5
			case 0x0350: //MCS-6
				{
				iTemp = iStream.readUnsignedShort(); // word 1
				var ps1 = ((iTemp & 0xff00) >> 8) | ((iTemp & 0x00ff) << 8);
				iTemp = iStream.readUnsignedShort(); // word 2

				if ((ps1 >= 0) && (ps1 <= 1))
				{
					for (var i = 3, j = 0; i < 7; i++) // word 3 .. 6
					{
						iTemp = iStream.readUnsignedShort();
						header[j++] = (iTemp & 0xFF00) >> 8;
						header[j++] = (iTemp & 0x00ff);
					}

					// get elements from header independent on header type
					var tfi = ((header[0] & 0xC0) >> 6) | ((header[1] & 0x07) << 2);
					var cv = ((header[0] & 0x3C) >> 2);
					var si = ((header[0] & 0x02) >> 1);
					var r = ((header[0] & 0x01) >> 0);
					var bsn = ((header[1] & 0xF8) >> 3) | ((header[2] & 0x3F) << 5);

					var pi = ((header[3] & 0x04) >> 2);
					var cps = ((header[2] & 0xC0) >> 6) | ((header[3] & 0x01) << 2);
					var cpsStr = decodeCPS_H2(cps);

					result = "BSN:" + bsn + ", " + "CPS:" + cpsStr + "(" + cps + ")"
					+ ", " + "CV:" + cv + ", " + "TFI:" + tfi + ", " + "SI:" + si
					+ ", " + "R:" + r + ", " + "PI:" + pi;
				}
				else
				{
					result = "Unknown PS (" + ps1 + ") for Blockformat ("
					+ blockformat + ")";
				}
				}
			break;

			case 0x0360: //MCS-7
			case 0x0370: //MCS-8
			case 0x0380: //MCS-9
				{
				iTemp = iStream.readUnsignedShort(); // word 1
				var ps1 = ((iTemp & 0xff00) >> 8) | ((iTemp & 0x00ff) << 8);
				iTemp = iStream.readUnsignedShort(); // word 2
				var ps2 = ((iTemp & 0xff00) >> 8) | ((iTemp & 0x00ff) << 8);

				if ((ps1 >= 0) && (ps1 <= 4) && (ps2 >= 0) && (ps2 <= 4))
				{
					for (var i = 3, j = 0; i < 7; i++) // word 3 .. 6
					{
						iTemp = iStream.readUnsignedShort();
						header[j++] = (iTemp & 0xFF00) >> 8;
						header[j++] = (iTemp & 0x00ff);
					}

					// get elements from header independent on header type
					var tfi = ((header[0] & 0xC0) >> 6) | ((header[1] & 0x07) << 2);
					var cv = ((header[0] & 0x3C) >> 2);
					var si = ((header[0] & 0x02) >> 1);
					var r = ((header[0] & 0x01) >> 0);
					var bsn1 = ((header[1] & 0xF8) >> 3) | ((header[2] & 0x3F) << 5);

					var bsn2 = ((((header[2] & 0xC0) >> 6) | ((header[3] & 0xFF) << 2)) + bsn1) % 2048;

					var pi = ((header[4] & 0x40) >> 6);
					var cps = ((header[4] & 0x1F) >> 0);
					var cpsStr = decodeCPS_H1(cps);

					result = "BSN1:" + bsn1 + ", " + "BSN2:" + bsn2 + ", " + "CPS:"
					+ cpsStr + "(" + cps + ")" + ", " + "CV:" + cv + ", "
					+ "TFI:" + tfi + ", " + "SI:" + si + ", " + "R:" + r + ", "
					+ "PI:" + pi;
				}
				else
				{
					result = "Unknown PS1 or PS2 (" + ps1 + "," + ps2
					+ ") for Blockformat (" + blockformat + ")";
				}
				}
			break;

			default:
				result = STR_UNDEFINED_BLOCK_FORMAT + " (" + blockformat + ")";
			}
		}
		else
		{
			result = return_message_length_do_not_fit(iStream.available());
		}
	}
	catch (e if e.javaException instanceof java.io.EOFException)
	{
		logException( e );
		result = "End Of File Error";
	}
	catch (e if e.javaException instanceof java.io.IOException)
	{
		logException( e );
		result = "Input Output Error";
	}
	catch (e if e.javaException instanceof java.lang.Exception)
	{
		logException( e );
		result = "";
	}
	return result;
}

//////////////////////////////////////////////
/* *** MESSAGE : SN_UNITDATA_REQ / SN_UNITDATA_IND *** */
function dec_SN_UNITDATA_REQ_IND( iStream, bool) // not yet adapt for SGOLD
{
	isIndMsg = bool;

	if (iStream.available() > 4)
	{
		try {
			iStream.skipBytes(6); // octet 1-6
			return ipDecoder( iStream ); // octet 7-...
		} catch ( e ) {
			logException( e );
		}
	}
	return "";
}

////////////////////////        ipDecoder
function ipDecoder( iStream )
{
	if ( iStream.available() <= 20 ) {
		return "Invalid IP Message";
		}

	var firstByte = iStream.readUnsignedByte();										// octet 0
	var result = "";

	/* decode IP Header */
	var version = (firstByte & 0xF0) >> 4;
	if (version == 4)
	{
		// IPv4
		var header_length = firstByte & 0x0F;
		iStream.skipBytes(1);															// octet 1
		var length = get_sn(iStream.readUnsignedByte(), iStream.readUnsignedByte());	// octet 2 and octet 3
		var id = get_sn(iStream.readUnsignedByte(), iStream.readUnsignedByte());		// octet 4 and octet 5
		iStream.skipBytes(3);															// octet 6-8
		var protocol = iStream.readUnsignedByte(); 										// octet 9
		switch (protocol) {
			case 1:
				result = "IP:ICMP ";
				break;
			case 2:
				result = "IP:IGMP ";
				break;
			case 6:
				result = "IP:TCP ";
				break;
			case 17:
				result = "IP:UDP ";
				break;
			default:
				result = "prot=" + protocol + " ";
				break;
			}

		result += "id=" + id + " ";
		result += "length=" + length + " ";
		iStream.skipBytes(2);															// octet 10-11
		result += "src="	+       convert_uint2str( iStream.readUnsignedByte() )		// octet 12
							+ "." + convert_uint2str( iStream.readUnsignedByte() )		// octet 13
							+ "." + convert_uint2str( iStream.readUnsignedByte() )		// octet 14
							+ "." + convert_uint2str( iStream.readUnsignedByte() );		// octet 15

		result += " dest="  +       convert_uint2str( iStream.readUnsignedByte() )		// octet 16
							+ "." + convert_uint2str( iStream.readUnsignedByte() )		// octet 17
							+ "." + convert_uint2str( iStream.readUnsignedByte() )		// octet 18
							+ "." + convert_uint2str( iStream.readUnsignedByte() );		// octet 19

		iStream.skipBytes(header_length - 5);

		switch (protocol) {
			case 17:
				result += decode_udp( iStream );
				break;
			case 6:
				result += decode_tcp( iStream );
				break;
			case 1:
				result += decode_icmp( iStream );
				break;
			default:
				result += "unkown protocol";
			}
	}
	else if (version == 6)
	{
		// IPv6
		var classOfTraffix = iStream.readUnsignedByte();								// octet 1
		var classOfTraffix = (firstByte & 0x0F) * 16 + ((classOfTraffix & 0xF0) / 16);
		iStream.skipBytes(2);															// octet 2, 3
		var length = get_sn(iStream.readUnsignedByte(), iStream.readUnsignedByte());	// octet 4 and octet 5
		var NextHeader = iStream.readUnsignedByte();									// octet 6
		var hopLimit = iStream.readUnsignedByte();										// octet 7

		switch (NextHeader) {
			case  0:	result += "Hop-by-Hop"; break;
			case 60:	result += "Destination Options (with Routing Options)"; break;
			case 43:	result += "Routing Header"; break;
			case 44:	result += "Fragment Header"; break;
			case 51:	result += "Authentication Header"; break;
			case 50:	result += "Encapsulation Security Payload Header"; break;
			case 60:	result += "Destination Options"; break;
			case 135:	result += "Mobility Header"; break;
			case 59:	result += "No next header"; break;
			case 6:		result += "TCP"; break;
			case 17:	result += "UDP"; break;
			case 58:	result += "ICMPv6"; break;
			default:	result += "NextHeader=" + NextHeader; break;
		}

		result += " Class=" + classOfTraffix + " ";
		result += " length=" + length + " ";
		result += " src="	+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 8
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 9
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 10
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 11
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 12
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 13
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 14
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 15
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 16
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 17
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 18
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 19
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 20
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 21
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 22
							+       intToHexString( iStream.readUnsignedByte(), 2 );	// octet 23

		result += " dest="	+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 24
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 25
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 26
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 27
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 28
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 29
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 30
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 31
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 32
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 33
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 34
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 35
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 36
							+       intToHexString( iStream.readUnsignedByte(), 2 )		// octet 37
							+ ":" + intToHexString( iStream.readUnsignedByte(), 2 )		// octet 38
							+       intToHexString( iStream.readUnsignedByte(), 2 );	// octet 39

	}
	else
	{
		result = "unknown IP version";
	}
	return( result );
}


function decode_udp( iStream )
{
	var    result = "";
	var    len, pos;
	var    tmp;

	result = " src-port="    + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte());		// octet 0-1
	result += " dest-port="  + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte());		// octet 2-3

	len = get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte());							// octet 4-5
	result += " len=" + len;
	tmp = get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );							// octet 6-7
	result += " udp_sum=0x" + tmp.toString(16);

	return result;
}

function decode_icmp( iStream )
{
	var result = "";
	var type_l = iStream.readUnsignedByte();														// octet 0
	var code_l = iStream.readUnsignedByte();														// octet 1
	iStream.skipBytes(2);																			// octet 2-3

	switch (type_l) {
	case 0:
		result += " Echo Reply Message, ";
		if (code_l == 0) {
			result += " Id=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );	// octet 4-5
			result += " SeqNo=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );	// ocett 6-7
			}
		else {
			}

		result += " Data='" + String.fromCharCode(iStream.readUnsignedByte()) + String.fromCharCode(iStream.readUnsignedByte()) +
							  String.fromCharCode(iStream.readUnsignedByte()) + String.fromCharCode(iStream.readUnsignedByte()) + " ...'";	// octet 8-11
		break;

	case 3:
		result += " Destination Unreachable Message, ";
		switch (code_l) {
			case 0:
				result += "net unreachable";
				break;
			case 1:
				result += "host unreachable";
				break;
			case 2:
				result += "protocol unreachable";
				break;
			case 3:
				result += "port unreachable";
				break;
			case 4:
				result += "fragmentation needed and DF set";
				break;
			case 5:
				result += "source route failed";
				break;
			default:
				result += "unkown code " + code_l;
				break;
			}
		break;

	case 4:
		result += " Source Quench Message";
		break;

	case 5:
		result += " Redirect Message, ";
		switch (code_l) {
			case 0:
				result += "Redirect datagrams for the Network";
				break;
			case 1:
				result += "Redirect datagrams for the Host";
				break;
			case 2:
				result += "Redirect datagrams for the Type of Service and Network";
				break;
			case 3:
				result += "Redirect datagrams for the Type of Service and Host";
				break;
			default:
				result += "unkown code " + code_l;
				break;
			}

		result += " Gateway=" +     convert_uint2str( iStream.readUnsignedByte() )					// Octet 4
							+ "." + convert_uint2str( iStream.readUnsignedByte() )					// Octet 5
							+ "." + convert_uint2str( iStream.readUnsignedByte() )					// Octet 6
							+ "." + convert_uint2str( iStream.readUnsignedByte() );					// Octet 7
		break;

	case 8:
		result += " Echo Message,";
		if (code_l == 0) {
			result += " Id=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );	// octet 4-5
			result += " SeqNo=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );	// octet 6-8
			}
		else {
		}

		result += " Data='" + String.fromCharCode(iStream.readUnsignedByte()) + String.fromCharCode(iStream.readUnsignedByte()) +
							  String.fromCharCode(iStream.readUnsignedByte()) + String.fromCharCode(iStream.readUnsignedByte()) + " ...'";
		break;

	case 11:
		result += " Time Exceeded Message, ";
		switch (code_l) {
			case 0:
				result += "time to live exceeded in transit";
				break;
			case 1:
				result += "fragment resassembly time exceeded";
				break;
			default:
				result += "unkown code " + code_l;
				break;
			}
		break;

	case 12:
		result += " Parameter Problem Message, ";
		switch (code_l) {
			case 0:
				result += "pointer to octet=" + iStream.readUnsignedByte();			// octet 4
				break;
			default:
				result += "unkown code " + code_l;
				break;
			}
		break;

	case 13:
		result += " Timestamp Message,";
		if (code_l == 0) {
			result += " Id=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 4-5
			result += " SeqNo=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 6-7
			}
		else {
			}
		result += " OrgTime=" + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte();	// octet 8-11
		break;

	case 14:
		result += " Timestamp Reply Message,";
		if (code_l == 0) {
			result += " Id=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 4-5
			result += " SeqNo=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 6-7
			}
		else {
			}
		result += " OrgTime=" + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte();		// octet 8-11
		result += " RxTime="  + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte();		// octet 12-15
		result += " TxTime="  + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte() + iStream.readUnsignedByte();		// octet 16-19
		break;

	case 15:
		result += " Information Request Message";
		if (code_l == 0) {
			result += " Id=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 4-5
			result += " SeqNo=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 6-7
			}
		break;

	case 16:
		result += " Information Reply Message";
		if (code_l == 0) {
			result += " Id=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 4-5
			result += " SeqNo=" + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );			// octet 6-7
			}
		break;
	}

	return result;
}

function decode_tcp( iStream )
{
	var    result = "";
	var    tmp;

	result = " src-port="    + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte());			// octet 0-1
	result += " dest-port="  + get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte());			// octet 2-3

	result += " seq="  + get_int( iStream.readUnsignedByte(), iStream.readUnsignedByte(),
								  iStream.readUnsignedByte(), iStream.readUnsignedByte() );				// octet 4-7

	result += " ack="  + get_int( iStream.readUnsignedByte(), iStream.readUnsignedByte(),
								  iStream.readUnsignedByte(), iStream.readUnsignedByte() );				// octet 8-11

	result += " dto=" + ((parseInt(iStream.readUnsignedByte()) & 0xF0) >> 4);							// octet 12

	var flag = iStream.readUnsignedByte();																// octet 13
	var ack = ((parseInt(flag) & 0x10 ) >> 4);
	var rst = ((parseInt(flag) & 0x04 ) >> 2);
	var syn = ((parseInt(flag) & 0x02 ) >> 1);
	var fin =   parseInt(flag) & 0x01;
	result += " flags(ACK:"+ack+",RST:"+rst+",SYN:"+syn+",FIN:"+fin+")";

	tmp = get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );								// octet 14-15
	result += " win=0x" + tmp.toString(16);

	tmp = get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );								// octet 16-17
	result += " tcp_sum=0x" + tmp.toString(16);

	tmp = get_sn( iStream.readUnsignedByte(), iStream.readUnsignedByte() );								// octet 18-19
	result += " urp=0x" + tmp.toString(16);

	return result;
}

//////////////////////////////////////////////////////////
function Decode_RLC_CTRL_INFO( iStream )
{
	var result = "";
	var len = iStream.available();
	var fsn;

	if (len < 8)
	{
		return WRONG_MSG_LEN;
	}

	iStream.skipBytes(2);
	var ctrl_hdr = iStream.readUnsignedByte();

	switch (ctrl_hdr)
	{
		case 0: // SENT STATUS MSG
			result = Decode_RLC_SENT_STATUS_MSG(iStream);
			break;

		case 1: // RCVD ACK SUFI
			iStream.skipBytes(3);
			var sn = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result = " R-Ack" + VALUE_SEP + "SN" + EQUALS + sn;
			iStream.skipBytes(12);
			break;

		// case 2: // RETRANSMISSION LIST - NOT USED

		case 3: // RESET RECEIVED
			iStream.skipBytes(3);
			var rsn = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result = " R-RST" + VALUE_SEP + "RSN" + EQUALS + rsn;
			iStream.skipBytes(12);
			break;

		case 4: // RESET ACK RECEIVED
			iStream.skipBytes(3);
			var rsn = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result = " R-RST_ACK" + VALUE_SEP + "RSN" + EQUALS + rsn;
			iStream.skipBytes(12);
			break;

		// case 5: UPDATE_VTMS - NOT USED
		// case 6: UPDATE_VTMS_ACK - NOT USED
		// case 7: MRW - NOT USED

		case 8: // MRW ACK RECEIVED
			iStream.skipBytes(17);
			result = " R-MRW_ACK";
			var a = iStream.readUnsignedByte();
			var b = iStream.readUnsignedByte();
			result += (a & 0x00F0);
			var sn = get_sn(a, b);
			break;

		case 9: // RCVD RLIST SUFI
			result = " R-RList";
			iStream.skipBytes(3);
			var sn_len = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result += VALUE_SEP + "L" + EQUALS + sn_len + " FSNs" + EQUALS;
			iStream.skipBytes(12);
			for (i = 0; i < sn_len; i++)
			{
				fsn = swapbyte_return_word(iStream.readUnsignedByte(),iStream.readUnsignedByte());
				result += " " + fsn;
			}
			break;

		case 10: // RCVD LIST SUFI
			result = " R-List";
			iStream.skipBytes(3);
			var sn_len = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result += VALUE_SEP + "L" + EQUALS + sn_len + " FSNs" + EQUALS;
			iStream.skipBytes(12);
			for (i = 0; i < sn_len; i++)
			{
				fsn = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
				result += " " + fsn;
			}
			break;

		case 11: // RCVD BITMAP SUFI
			result = " R-Bmp";
			iStream.skipBytes(3);
			var sn_len = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result += VALUE_SEP + "L" + EQUALS + sn_len + " FSNs" + EQUALS;
			iStream.skipBytes(12);
			for (i = 0; i < sn_len; i++)
			{
				fsn = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
				result += " " + fsn;
			}
			break;

		case 12: // WSN RECEIVED
			iStream.skipBytes(3);
			var wsn = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result = " R-Wsn" + VALUE_SEP + "WSN" + EQUALS + wsn;
			iStream.skipBytes(12);
			break;

		case 13: // SENT PROCESSING COMPLETE
			iStream.skipBytes(3);
			var rbid = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result = " P-Cmp" + VALUE_SEP + "RB" + EQUALS + rbid;
			iStream.skipBytes(12);
			break;

		case 14: // DUPLICAT_RESET RECEIVED
			iStream.skipBytes(3);
			var rsn = swapbyte_return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte());
			result = " R-DupRST" + VALUE_SEP + "RSN" + EQUALS + rsn;
			iStream.skipBytes(12);
			break;

		default:
			result = " " + ctrl_hdr;
			break;
		}

	return result;
}

// ////////////////////////////////////////////////////////
function Decode_RLC_SENT_STATUS_MSG( iStream, tmp)
{
	var result = "";
	var len = iStream.available();
	if (len >= 18)
	{
		iStream.skipBytes(17);
		var sufi_type = iStream.readUnsignedByte();

		switch ((sufi_type & 0x00F0) >> 4)
		{
		case 0:
			result = " S-NM"; // NO MORE SUFI
			break;

		case 1: // NOT USED
			result = " S-WSN"; // WSN SUFI
			break;

		case 2:
			result = Decode_RLC_ACK_SUFI( iStream, sufi_type); // ACK SUFI
			break;

		case 3:
			result = Decode_RLC_LIST_SUFI( iStream, sufi_type); // LIST SUFI
			break;

		case 4:
			//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&---------------this part is pending creating class inside script. &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
			// result = Decode_RLC_BITMAP_SUFI(sufi_type); // BITMAP SUFI
			break;

		case 5:
			result = Decode_RLC_RLIST_SUFI( iStream, sufi_type); // RLIST SUFI
			break;

		//case 6:
			//result = Decode_RLC_RLIST_SUFI( iStream, sufi_type); // MRW SUFI
			//break;

		//case 7:
			//result = Decode_RLC_RLIST_SUFI( iStream, sufi_type); // MRW ACK SUFI
			//break;

		default:
			result = " " + sufi_type;
			break;
		}

		}
	else
	{
		result = return_message_length_do_not_fit(len);
	}

	return result;
}

///////////////////////////////////////////////////////
function Decode_RLC_ACK_SUFI( iStream, first_byte )
{
	var result = "";
	var len = iStream.available();
	if (len >= 1)
	{
		var last_byte = iStream.readUnsignedByte();
		var sn = get_sn(first_byte, last_byte);
		result = " S-Ack" + VALUE_SEP + "SN" + EQUALS + sn;
	}
	else
	{
		result = return_message_length_do_not_fit(len);
	}

	return result;
}

/////////////////////////////////////////////////////
function Decode_RLC_RLIST_SUFI( iStream, first_byte )
{
	var result = "";
	var len = iStream.available();
	var a, b, sn;
	if (len >= 2)
	{
		var length = first_byte & 0x000F;
		result = " S-RList" + VALUE_SEP + "L" + EQUALS + length;
		a = iStream.readUnsignedByte();
		b = iStream.readUnsignedByte();
		sn = get_list_sn(a, b);
		result += " SN" + EQUALS + sn;
	}
	else
	{
		result = return_message_length_do_not_fit(len);
	}

	return result;
}

/////////////////////////////////////////////////////
function Decode_RLC_LIST_SUFI( iStream, first_byte )
{
	var result = "";
	var len = iStream.available();
	var i;
	var a, b, sn;

	if (len >= 2)
	{
		var length = first_byte & 0x000F;
		result = " S-List" + VALUE_SEP + "L" + EQUALS + length;

		for (i = 1; i <= length; i++)
		{
			a = iStream.readUnsignedByte();
			b = iStream.readUnsignedByte();
			sn = get_list_sn(a, b);
			b = b & 0x000F;
			result += " (" + sn + "," + b + ")";

			if (i != length)
				result += ",";
		}
	}
	else
	{
		result = WRONG_MSG_LEN;
	}

	return result;
}

////////////////////////////////////////////////////////
function intToHexString(digit, nrOfChars)
{
	var result = new String("");
	var hexStr = new String("");

	hexStr = Integer.toHexString(digit).toUpperCase();
	var len = hexStr.length();
	if (len < nrOfChars)
	{
		for (var i = hexStr.length(); i < nrOfChars; i++)
		{
			result += "0";
		}
	}
	if (len > nrOfChars)
		hexStr = hexStr.substr( len-2, 2);

	return result + hexStr;
}

////////////////////////////////////////////////////////
function alignStr( strToAlign, nrOfChars)
{
	var resultStr = new String(strToAlign);

	if (resultStr.length < nrOfChars)
	{
		resultStr += "                                   ";
		resultStr = resultStr.substring( 0, nrOfChars );

	}
	return resultStr;
}

////////////////////////////////////////////////////////
function numberToChar(num)
{                //converting int into char
	return String.fromCharCode(num);
}

////////////////////////////////////////////////////////
function endsWith( curStr, suffix )
{
    curStr = new String(curStr );
    if (curStr.indexOf( suffix, curStr.length - suffix.length) !== -1)
        return( true );
    return( false );
}

////////////////////////////////////////////////////////
//
//Return string  of hex ASCII values as string
//
function hex_to_string(hexBuffer)
{
	var str = '';
	var byte_str = '';

	for (var i = 0; i < hexBuffer.length(); i++)
	{
		if(i%2 == 0)
		{
			byte_str = hexBuffer.substring(i, i+1);
		}
		else
		{
			byte_str += hexBuffer.substring(i, i+1);
			str += String.fromCharCode(parseInt(byte_str, 16));
		}
	}
	return str
}


///////////////////////////////////////////////
/* *** MESSAGE : LLT_L1_PCKD_PDTCH_TX_HEADER *** */
///////////////////////////////////////
/**
 * gttp_msg_type : Submethod that returns the message type of "GPRS Transparent Transport Protocol (GTTP)" messages
 */
function gttp_msg_type(msg_type)
{
	var res = UNKNOWN_TYPE;
	switch (msg_type)
	{
	case 0:
		res = "GPRS Information";
		break;
	}
	return res;
} // end of method "gttp_msg_type"
//////////////////////
/**
 * mm_non_gprs_msg_type : Submethod that returns the message type of an MM
 * message
 *
 */
function mm_non_gprs_msg_type(msg_type)
{
	var res = UNKNOWN_TYPE + "type = " + msg_type;
	switch (msg_type)
	{
	case 1:
		res = "IMSI Detach Indication";
		break;
	case 2:
		res = "Location Updating Accept";
		break;
	case 4:
		res = "Location Updating Reject";
		break;
	case 8:
		res = "Location Updating Request";
		break;
	case 17:
		res = "Authenication Reject";
		break;
	case 18:
		res = "Authentication Request";
		break;
	case 20:
		res = "Authentication Response";
		break;
	case 24:
		res = "MM Identity Request";
		break;
	case 25:
		res = "MM Identity Response";
		break;
	case 26:
		res = "TMSI Reallocation Command";
		break;
	case 27:
		res = "TMSI Reallocation Complete";
		break;
	case 28:
		res = "Authentication Failure";
		break;
	case 33:
		res = "CM Service Accept";
		break;
	case 34:
		res = "CM Service Reject";
		break;
	case 35:
		res = "CM Service Abort";
		break;
	case 36:
		res = "CM Service Request";
		break;
	case 37:
		res = "CM Service Prompt";
		break;
	case 40:
		res = "CM Re-Establishment Request";
		break;
	case 41:
		res = "Abort";
		break;
	case 48:
		res = "MM Null";
		break;
	case 49:
		res = "MM Status";
		break;
	case 50:
		res = "MM Information";
		break;
	default:
		res += msg_type;
		break;
	}
	return res;
} // end of method "mm_non_gprs_msg_type"
//////////////////////

/**
 * rr_msg_type : Submethod that returns the message type of an RR message
 */
function rr_msg_type(msg_type)
{
	var res = UNKNOWN_TYPE;
	switch (msg_type)
	{
	case 60:
		res = "RR Initialisation Request";
		break;
	case 59:
		res = "Addidional Assignment";
		break;
	case 63:
		res = "Immediate Assignment";
		break;
	case 57:
		res = "Immediate Assignment Extended";
		break;
	case 58:
		res = "Immediate Assignment reject";
		break;
	case 53:
		res = "Ciphering Mode Command";
		break;
	case 50:
		res = "Ciphering Mode Complete";
		break;
	case 48:
		res = "Configuration Change Command";
		break;
	case 49:
		res = "Configuration Change Ack";
		break;
	case 51:
		res = "Configuration Change Reject";
		break;
	case 46:
		res = "Assignment Command";
		break;
	case 41:
		res = "Assignment Complete";
		break;
	case 47:
		res = "Assignment failure";
		break;
	case 43:
		res = "Handover Command";
		break;
	case 44:
		res = "Handover Complete";
		break;
	case 40:
		res = "Handover Failure";
		break;
	case 45:
		res = "Physical Information";
		break;
	case 8:
		res = "RR Cell Change Order";
		break;
	case 35:
		res = "PDCH Assignment Command";
		break;
	case 13:
		res = "Channel Release";
		break;
	case 10:
		res = "Partial Release";
		break;
	case 15:
		res = "Partial Relase Complete";
		break;
	case 33:
		res = "PR1"; // "Paging Request Type 1"
		break;
	case 34:
		res = "PR2"; // "Paging Request Type 2"
		break;
	case 36:
		res = "PR3"; // "Paging Request Type 3"
		break;
	case 39:
		res = "Paging Response";
		break;
	case 32:
		res = "Notification NCH";
		break;
	case 37:
		res = "Notification FACCH";
		break;
	case 38:
		res = "Notification Response";
		break;
	case 24:
		res = "SI8"; // "System Information 8";
		break;
	case 25:
		res = "SI1"; // "System Information 1";
		break;
	case 26:
		res = "SI2"; // "System Information 2";
		break;
	case 27:
		res = "SI3"; // "System Information 3";
		break;
	case 28:
		res = "SI4"; // "System Information 4";
		break;
	case 29:
		res = "SI5"; // "System Information 5";
		break;
	case 30:
		res = "SI6"; // "System Information 6";
		break;
	case 31:
		res = "SI7"; // "System Information 7";
		break;
	case 2:
		res = "SI2bis"; // "System Information 2bis";
		break;
	case 3:
		res = "SI2ter"; // "System Information 2ter";
		break;
	case 5:
		res = "SI5bis"; // "System Information 5bis";
		break;
	case 6:
		res = "SI5ter"; // "System Information 5ter";
		break;
	case 4:
		res = "SI9"; // "System Information 9";
		break;
	case 0:
		res = "SI13"; // "System Information 13";
		break;
	case 16:
		res = "Channnel Mode Modify";
		break;
	case 18:
		res = "RR Status";
		break;
	case 23:
		res = "Channel Mode Modify Acknolwdge";
		break;
	case 20:
		res = "Frequency Redefinition";
		break;
	case 21:
		res = "Measurement Report";
		break;
	case 22:
		res = "Classmark Change";
		break;
	case 19:
		res = "Classmark Enquiry";
		break;
	case 54:
		res = "Extended Measurement Report";
		break;
	case 55:
		res = "Extended Measurement Order";
		break;
	case 52:
		res = "GPRS Suspension Request";
		break;
	case 9:
		res = "VGCS Uplink Grant";
		break;
	case 14:
		res = "Uplink Release";
		break;
	case 12:
		res = "Uplink Free";
		break;
	case 42:
		res = "Uplink Busy";
		break;
	case 17:
		res = "Talker Indication";
		break;
	}
	return res;
}

///////////////////////////////////////////////////////////////////////////////////
function dec_NAS_04_08_MSG_3( msg )
{
	// seach for a string like **  Routing Area Update Accept  **
	// see also dec_layer3()
	var result = "";

	var decoding = "";
	try {
		decoding = new String(service.getDecodedStructValue(PanelLG, msg, "Derefrenced Pointer Data", "Pointer_0 : Layer 3 Message"));
		var patternStr = new RegExp("\\*\\* +(.*?) +\\*\\*");
		var matcher = patternStr.exec(decoding);
		if (void 0 != matcher)
		{
			result = matcher[1];
		}
		else
		{
			return "";
		}

		// for some messages we like to get more informations
		// to make it more robust we convert everything to UPPER CASE
		var Token = new String(result.toUpperCase());

		if(Token.equalsIgnoreCase("ROUTING AREA UPDATE ACCEPT") )
		{
			var patternStr = new RegExp("(\\d+) decihours");
			var matcher = patternStr.exec(decoding);
			if (void 0 != matcher)
			{
				result += "; T3312=";
				result += matcher[1];
			}
		}

		if(Token.equalsIgnoreCase("ROUTING AREA UPDATE REQUEST") || Token.equalsIgnoreCase("LOCATION UPDATING REQUEST"))
		{
			if (decoding.indexOf("Periodic updating") >= 0 )
				result += " - Periodic";
		}

//		if(result.equalsIgnoreCase("ROUTING AREA UPDATE REJECT") || result.equalsIgnoreCase("LOCATION UPDATING REJECT") || result.equalsIgnoreCase("ATTACH REJECT"))
		{
			var patternStr =  new RegExp("[cC]ause value[ ]*\\: ([a-zA-Z ]*) \\:");
			var matcher = patternStr.exec(decoding);
			if (void 0 != matcher)
			{
				result += TYPE_SEP2 + "Cause: " + matcher[1];
			}
		}

	} catch(e) {
		logException( e );
	}

	return result;
}

////////////////////////////////////////////////
function dec_Global_Packet_Timing_Advance(stringBuffer)
{
	addToStringVector(getSubStringValue5Args(stringBuffer, "TIMING_ADVANCE_VALUE", "TAdv_V=", 29, 31));
	addToStringVector(getSubStringValue5Args(stringBuffer, "UPLINK_TIMING_ADVANCE_INDEX", "UL_TAdv_I=", 36, 38));
	addToStringVector(getSubStringValue5Args(stringBuffer, "UPLINK_TIMING_ADVANCE_TIMESLOT_NUMBER", "UL_TAdv_TN=", 46, 48));
	addToStringVector(getSubStringValue5Args(stringBuffer, "DOWNLINK_TIMING_ADVANCE_INDEX", "DL_TAdv_I=", 38, 40));
	addToStringVector(getSubStringValue5Args(stringBuffer, "DOWNLINK_TIMING_ADVANCE_TIMESLOT_NUMBER", "DL_TAdv_TN=", 48, 50));
}

/////////////////////////////////////////////////
function dec_Dynamic_Allocation_Struct(stringBuffer)
{
	dec_Dynamic_Allocation_Struct5Args(stringBuffer, "USF_TN", 7, 16);
	dec_Dynamic_Allocation_Struct5Args(stringBuffer, "GAMMA_TN", 9, 18);
}

function dec_Dynamic_Allocation_Struct5Args(stringBuffer, stringToMatch, offset1, offset2)
{
	var stringToReturn = "";
	var subStringIndex = 0;
	var nextIndex = 0;

	try {
		subStringIndex = stringBuffer.indexOf(stringToMatch);
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	if (subStringIndex > 0)
	{
		nextIndex = subStringIndex;
		while (nextIndex > 0)
		{
			try
			{
				stringToReturn = stringBuffer.substring(nextIndex, (nextIndex + offset1)) + EQUALS;
			} catch(e) {
				logException( e );
				stringToReturn += "-1";
			}
			stringToReturn += getDecValueFromString3Agrs(stringBuffer, nextIndex + offset2, nextIndex + offset2 + 2); // //getDecValueFromString
			addToStringVector(stringToReturn);
			try
			{
				nextIndex = stringBuffer.indexOf(stringToMatch, nextIndex + 5);
			} catch(e) {
				logException( e );
				nextIndex = -1;
			}
		}
	}
}

/////////////////////////////////////////////////
function dec_TBF(stringBuffer)
{
	var stringToReturn = "";
	var subStringIndex = 0;
	var hexString = "";

	try {
		subStringIndex = stringBuffer.indexOf("TBF_STARTING_TIME (HEX)");
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	if (subStringIndex > 0)
	{
		try
		{
			hexString = stringBuffer.substring(subStringIndex + 26, subStringIndex + 28);
			hexString += stringBuffer.substring(subStringIndex + 29, subStringIndex + 31);
		} catch(e) {
			logException( e );
			hexString = "-1";
		}
		stringToReturn += "TBF Starting Time (SFN)= " + getDecValueFromString(hexString);
	}
	return stringToReturn;
}

/////////////////////////////////////////////////
function dec_Param( stringBuffer, stringToMatch, firstOffset, secondOffset )
{
	var stringToReturn = "-1";

	try {
		var index = 0;
		var endLineIndex = 0;
		var nextEndLineIndex = 0;
		index = stringBuffer.indexOf(stringToMatch);

		if (index > 0)
		{
			endLineIndex = stringBuffer.indexOf("\n", index);
			if (endLineIndex > 0)
			{
				nextEndLineIndex = stringBuffer.indexOf("\n", endLineIndex + 1);
				if (nextEndLineIndex > 0)
				{
					stringToReturn = stringBuffer.substring(nextEndLineIndex - firstOffset, nextEndLineIndex - secondOffset);
				}
			}
		}
	} catch(e) {
		logException( e );
	}
	return stringToReturn;
}

/////////////////////////////////////////////////
function dec_Mobile_Allocation(stringBuffer)
{
	var stringToReturn = "";
	var subStringIndex = 0;

	try
	{
		subStringIndex = stringBuffer.indexOf("No channel hopping", subStringIndex);
		if (subStringIndex > 0)
			stringToReturn += "MobAlloc: no Hopping";
		else
			stringToReturn += "MobAlloc: Hopping " + dec_Param(stringBuffer, "Mobile allocation length of contents", 25, 17);
	} catch(e) {
		logException( e );
		subStringIndex = "-1";
	}

	return stringToReturn;
}

//////////////////////////////////////////////////
function dec_Channel_Type(stringBuffer)
{
	var stringToReturn = "ChType:";
	var subStringIndex = 0;
	var ARFCNString = "";

	stringToReturn += getSubStringValue5Args(stringBuffer, "TN (HEX)", "TN=", 11, 13) + TYPE_SEP;
	stringToReturn += getSubStringValue5Args(stringBuffer, "TSC (HEX)", "TSC=", 12, 14);
	try
	{
		subStringIndex = stringBuffer.indexOf("ARFCN (HEX)", subStringIndex);
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	if (subStringIndex > 0)
	{
		try
		{
			ARFCNString = stringBuffer.substring(subStringIndex + 14, subStringIndex + 16);
			ARFCNString += stringBuffer.substring(subStringIndex + 17, subStringIndex + 19);
		} catch(e) {
			logException( e );
			ARFCNString = "-1";
		}

		var arcfnInt  = getDecValueFromString(ARFCNString);
		if(arcfnInt > 32768)
		{
			arcfnInt -= 32768;
		}
		stringToReturn += TYPE_SEP + "ARFCN=" + arcfnInt;
	}
	return stringToReturn;
}

function parse_BCCH_BCH (decoding)
{
	var result = ["", ""];
	var patternStr = new RegExp("((?:masterInformationBlock --)|(?:systemInformationBlockType)|(?:schedulingBlock)|(?:seg_Count )|(?:segmentIndex ))(\\d+)((\\s).+) ");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		if ((matcher[1]).equals("systemInformationBlockType") ) {
			result[0] += " SIB ";
			result[0] += matcher[2];
		}
		if ((matcher[1]).equals("schedulingBlock") ) {
			result[0] += " SCHBLK ";
			result[0] += matcher[2];
		}
		if ((matcher[1]).equals("seg_Count ") ) {
			result[0] += " Segment 0 (tot ";
			result[0] += matcher[2];
			result[0] += ")";
		}
		if ((matcher[1]).equals("segmentIndex ") ) {
			result[0] += " Segment ";
			result[0] += matcher[2];
		}
		if ((matcher[1]).equals("masterInformationBlock --") ) {
			result[0] += " MIB ";
		}
		result[1] += matcher[3];
		}
	return result;
}

//////////////////////////////////////////////////
function dec_Rest_Octets(stringBuffer)
{
	var stringToReturn = "";

	stringToReturn += getSubStringValue3Args(stringBuffer, "EGPRS_Packet_Uplink_Assignment", "EPUAS");
	stringToReturn += getSubStringValue3Args(stringBuffer, "Packet_Uplink_Assignment", "PUAS");
	stringToReturn += getSubStringValue3Args(stringBuffer, "Packet_Downlink_Assignment", "PDAS");
	stringToReturn += getSubStringValue3Args(stringBuffer, "Extended_RA", "EPUAS");

	return stringToReturn;
}

////////////////////////////////////////////////
function dec_EGPRS_Channel_Coding_Command(stringBuffer)
{
	var stringToReturn = "";
	var mcsValue = -1;
	var subStringIndex = 0;

	try
	{
		subStringIndex = stringBuffer.indexOf("EGPRS_MCS");
		if (subStringIndex > 0)
			mcsValue = getDecValueFromString3Agrs(stringBuffer, subStringIndex + 18, subStringIndex + 20); // //getDecValueFromString

		if (mcsValue >= 0 && mcsValue < 9)
			stringToReturn += "EChCodCom=MCS-" + (mcsValue + 1);
		else if (mcsValue == 9)
			stringToReturn += "EChCodCom=MCS-" + "5-7";
		else if (mcsValue == 10)
			stringToReturn += "EChCodCom=MCS-" + "6-9";
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	return stringToReturn;
} // end of dec_EGPRS_Channel_Coding_Command


//////////////////////////////////////////////////////
function dec_EGPRS_Window_Size(stringBuffer, winSizeString, startIndex)
{
	var stringToReturn = "";
	var subStringIndex = 0;

	try {
		subStringIndex = stringBuffer.indexOf("EGPRS_Window_Size (HEX)", startIndex);
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	if (subStringIndex > 0)
		stringToReturn += getSubStringValue4Args(stringBuffer, winSizeString, subStringIndex + 26, subStringIndex + 28); //getSubStringValue

	return stringToReturn;
}

//////////////////////////////////////////////////
function dec_Packet_Timing_Advance(stringBuffer)
{
	var stringToReturn = "";
	var indexValue = 0;

	try
	{
		indexValue = stringBuffer.indexOf("TIMING_ADVANCE_VALUE");
	} catch(e) {
		logException( e );
		indexValue = -1;
	}

	if (indexValue > 0)
		stringToReturn += getSubStringValue4Args(stringBuffer, "TAdv_V=", indexValue + 29, indexValue + 31) + TYPE_SEP; //getSubStringValue

	try
	{
		indexValue = stringBuffer.indexOf("TIMING_ADVANCE_INDEX");
	} catch(e) {
		logException( e );
		indexValue = -1;
	}

	if (indexValue > 0)
		stringToReturn += getSubStringValue4Args(stringBuffer, "TAdv_I=", indexValue + 29, indexValue + 31) + TYPE_SEP; //getSubStringValue

	try
	{
		indexValue = stringBuffer.indexOf("TIMING_ADVANCE_TIMESLOT_NUMBER");
	} catch(e) {
		logException( e );
		indexValue = -1;
	}

	if (indexValue > 0)
		stringToReturn += getSubStringValue4Args(stringBuffer, "TAdv_TSN=", indexValue + 39, indexValue + 41); //getSubStringValue

	return stringToReturn;
}

///////////////////////////////////////////////
function dec_Global_TFI(stringBuffer, stringToMatch)
{
	var stringToReturn = "";
	var beginIndex = -1;
	var endIndex = -1;
	var nextIndex = 0;
	var gtfiValue = -1;
	var subStringIndex = 0;

	try {
		subStringIndex = stringBuffer.indexOf(stringToMatch);
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	if (subStringIndex > 0)
	{
		try {
			nextIndex = stringBuffer.indexOf("UPLINK_TFI (HEX)", subStringIndex);
		} catch(e) {
			logException( e );
			nextIndex = -1;
		}
		if (nextIndex > 0)
		{
			stringToReturn = "UL_GTFI=";
			beginIndex = 19;
			endIndex = 21;
		}
		else
		{
			try {
				nextIndex = stringBuffer.indexOf("DOWNLINK_TFI (HEX)", subStringIndex);
			} catch(e) {
				logException( e );
				nextIndex = -1;
			}
			if (nextIndex > 0)
			{
				stringToReturn = "DL_GTFI=";
				beginIndex = 21;
				endIndex = 23;
			}
		}
		gtfiValue = getDecValueFromString3Agrs(stringBuffer, nextIndex + beginIndex, nextIndex + endIndex);  // // getDecValueFromString
	}

	if (gtfiValue >= 0)
		stringToReturn += gtfiValue;

	return stringToReturn;
}

  //////////////////////////////////////////////////
function convertDcPrId( pr_id)//int type
{
	var procedure_id ="";
	switch (pr_id)
	{
		case 0  : procedure_id= "prd_id_null          ";break;
		case 1  : procedure_id= "prd_id_inact         ";break;
		case 2  : procedure_id= "prd_id_idle          ";break;
		case 3  : procedure_id= "prd_id_initxfer      ";break;
		case 4  : procedure_id= "prd_id_connest       ";break;
		case 5  : procedure_id= "prd_id_connrel       ";break;
		case 6  : procedure_id= "prd_id_sigrel        ";break;
		case 7  : procedure_id= "prd_id_sigrelind     ";break;
		case 8  : procedure_id= "prd_id_ulxfer        ";break;
		case 9  : procedure_id= "prd_id_dlxfer        ";break;
		case 10 : procedure_id= "prd_id_loopback      ";break;
		case 11 : procedure_id= "prd_id_rbcfg         ";break;
		case 12 : procedure_id= "prd_id_config        ";break;
		case 13 : procedure_id= "prd_id_measctrl      ";break;
		case 14 : procedure_id= "prd_id_rachmeas      ";break;
		case 15 : procedure_id= "prd_id_tfcctrl       ";break;
		case 16 : procedure_id= "prd_id_uecapenq      ";break;
		case 17 : procedure_id= "prd_id_mobinfo       ";break;
		case 18 : procedure_id= "prd_id_cellupd       ";break;
		case 19 : procedure_id= "prd_id_updcntrl      ";break;
		case 20 : procedure_id= "prd_id_cellrescfg    ";break;
		case 21 : procedure_id= "prd_id_celleval      ";break;
		case 22 : procedure_id= "prd_id_evalcntrl     ";break;
		case 23 : procedure_id= "prd_id_siupdate      ";break;
		case 24 : procedure_id= "prd_id_asu           ";break;
		case 25 : procedure_id= "prd_id_pagetype2     ";break;
		case 26 : procedure_id= "prd_id_smc           ";break;
		case 27 : procedure_id= "prd_id_cntchk        ";break;
		case 28 : procedure_id= "prd_id_rbsuspend     ";break;
		case 29 : procedure_id= "prd_id_cbsctrl       ";break;
		case 30 : procedure_id= "prd_id_compr_err     ";break;
		case 31 : procedure_id= "prd_id_irhoinfoxfer  ";break;
		case 32 : procedure_id= "prd_id_irhofrutran   ";break;
		case 33 : procedure_id= "prd_id_irhotoutran   ";break;
		case 34 : procedure_id= "prd_id_irccotoutran  ";break;
		case 35 : procedure_id= "prd_id_irccofrutran  ";break;
		case 36 : procedure_id= "prd_id_irreselcntrl  ";break;
		case 37 : procedure_id= "prd_id_adatdlry      ";break;
		case 38 : procedure_id= "prd_id_deactl1u      ";break;
		case 39 : procedure_id= "prd_id_emulpeermsg   ";break;
		case 40 : procedure_id= "prd_id_rcrirredirection  ";break;
		case 41 : procedure_id= "prd_id_fastdormancy  ";break;
		case 42 : procedure_id= "prd_id_scritmr       ";break;
		case 43 : procedure_id= "prd_id_urrc_info_ind ";break;
		default : procedure_id= "unknown";break;
	}

	return procedure_id;
}

//////////////////////////////////////////////////
function convertDcProcedureState(prd_state) //int type
{
	var procedurestate="";
	switch (prd_state)
	{
		case 0 : procedurestate= "null                   ";break;
		case 1 : procedurestate= "start                  ";break;
		case 2 : procedurestate= "stop                   ";break;
		case 3 : procedurestate= "stop_error             ";break;
		case 4 : procedurestate= "inact_start            ";break;
		case 5 : procedurestate= "inact_phyrel           ";break;
		case 6 : procedurestate= "inact_phydeact         ";break;
		case 7 : procedurestate= "idle_cfg1              ";break;
		case 8 : procedurestate= "idle_cfg2              ";break;
		case 9 : procedurestate= "initxfer_rrcconn       ";break;
		case 10 : procedurestate= "initxfer_cellupd       ";break;
		case 11 : procedurestate= "initxfer_measrpt       ";break;
		case 12 : procedurestate= "initxfer_amcnf         ";break;
		case 13 : procedurestate= "initxfer_waitcfg       ";break;
		case 14 : procedurestate= "initxfer_waitconnrel   ";break;
		case 15 : procedurestate= "connest_waitclassmark  ";break;
		case 16 : procedurestate= "connest_waitmsradioacccap  ";break;
		case 17 : procedurestate= "connest_ccchcfg        ";break;
		case 18 : procedurestate= "connest_reqsent        ";break;
		case 19 : procedurestate= "connest_waitretry      ";break;
		case 20 : procedurestate= "connest_waitfreq       ";break;
		case 21 : procedurestate= "connest_conncfg        ";break;
		case 22 : procedurestate= "connest_measrpt        ";break;
		case 23 : procedurestate= "connest_ircellresel    ";break;
		case 24 : procedurestate= "connest_idlecfg        ";break;
		case 25 : procedurestate= "connest_resel          ";break;
		case 26 : procedurestate= "connest_setup_failed   ";break;
		case 27 : procedurestate= "connest_setup_oosvc    ";break;
		case 28 : procedurestate= "connrel_amcnf          ";break;
		case 29 : procedurestate= "connrel_idlecfg        ";break;
		case 30 : procedurestate= "connrel_tmr308         ";break;
		case 31 : procedurestate= "connrel_maccnf         ";break;
		case 32 : procedurestate= "connrel_cellupd        ";break;
		case 33 : procedurestate= "connrel_wfchild        ";break;
		case 34 : procedurestate= "sigrelind_cellupd      ";break;
		case 35 : procedurestate= "sigrelind_amcnf        ";break;
		case 36 : procedurestate= "sigrelind_waitcfg      ";break;
		case 37 : procedurestate= "ulxfer_measrpt         ";break;
		case 38 : procedurestate= "ulxfer_cellupd         ";break;
		case 39 : procedurestate= "ulxfer_amcnf           ";break;
		case 40 : procedurestate= "ulxfer_waitcfg         ";break;
		case 41 : procedurestate= "rbcfg_suspend          ";break;
		case 42 : procedurestate= "rbcfg_pchmac           ";break;
		case 43 : procedurestate= "rbcfg_pchrlc           ";break;
		case 44 : procedurestate= "rbcfg_pdcpsn           ";break;
		case 45 : procedurestate= "rbcfg_amcnf            ";break;
		case 46 : procedurestate= "rbcfg_subcfg1          ";break;
		case 47 : procedurestate= "rbcfg_subcfg2          ";break;
		case 48 : procedurestate= "rbcfg_subcfg3          ";break;
		case 49 : procedurestate= "rbcfg_cellupd1         ";break;
		case 50 : procedurestate= "rbcfg_cellupd2         ";break;
		case 51 : procedurestate= "rbcfg_cellupd3         ";break;
		case 52 : procedurestate= "rbcfg_rescfg           ";break;
		case 53 : procedurestate= "rbcfg_waitcfg          ";break;
		case 54 : procedurestate= "config_phyrel          ";break;
		case 55 : procedurestate= "config_bpstate         ";break;
		case 56 : procedurestate= "config_phymaci         ";break;
		case 57 : procedurestate= "config_phymacf         ";break;
		case 58 : procedurestate= "config_abort_upon_phymacf         ";break;
		case 59 : procedurestate= "config_phymacd         ";break;
		case 60 : procedurestate= "config_phymacd2        ";break;
		case 61 : procedurestate= "config_phymacd3        ";break;
		case 62 : procedurestate= "config_rlc             ";break;
		case 63 : procedurestate= "config_mstate          ";break;
		case 64 : procedurestate= "config_phy_inact       ";break;
		case 65 : procedurestate= "config_stop            ";break;
		case 66 : procedurestate= "config_oosvc_waitphycnf  ";break;
		case 67 : procedurestate= "rachmeas_waitrpt       ";break;
		case 68 : procedurestate= "mobinfo_cfg1           ";break;
		case 69 : procedurestate= "mobinfo_cfg2           ";break;
		case 70 : procedurestate= "mobinfo_suspend        ";break;
		case 71 : procedurestate= "mobinfo_cnf            ";break;
		case 72 : procedurestate= "mobinfo_pdcpsn         ";break;
		case 73 : procedurestate= "mobinfo_waitcfg        ";break;
		case 74 : procedurestate= "uecapenq_waitclassmark ";break;
		case 75 : procedurestate= "uecapenq_waitmsradioacccap  ";break;
		case 76 : procedurestate= "nasclassmark_waitclassmark  ";break;
		case 77 : procedurestate= "nasclassmark_waitmsradioacccap  ";break;
		case 78 : procedurestate= "uecapenq_waitcnf       ";break;
		case 79 : procedurestate= "uecapenq_waitcelupd    ";break;
		case 80 : procedurestate= "uecapenq_waitcfg       ";break;
		case 81 : procedurestate= "uecapenq_wait_grace_time       ";break;
		case 82 : procedurestate= "nas_change_cap         ";break;
		case 83 : procedurestate= "cellupd_initcfg        ";break;
		case 84 : procedurestate= "cellupd_retrycfg       ";break;
		case 85 : procedurestate= "cellupd_rcvmeas        ";break;
		case 86 : procedurestate= "cellupd_confirm        ";break;
		case 87 : procedurestate= "cellupd_cnfcfg         ";break;
		case 88 : procedurestate= "cellupd_confirm_ext    ";break;
		case 89 : procedurestate= "cellupd_suspend        ";break;
		case 90 : procedurestate= "cellupd_macid          ";break;
		case 91 : procedurestate= "cellupd_pdcpsn         ";break;
		case 92 : procedurestate= "cellupd_amcnf          ";break;
		case 93 : procedurestate= "cellupd_synccfg        ";break;
		case 94 : procedurestate= "cellupd_idle           ";break;
		case 95 : procedurestate= "updcntrl_cellupd       ";break;
		case 96 : procedurestate= "updcntrl_svccfg        ";break;
		case 97 : procedurestate= "updcntrl_abtcfg        ";break;
		case 98 : procedurestate= "updcntrl_rescfg        ";break;
		case 99 : procedurestate= "updcntrl_retrycfg      ";break;
		case 100 : procedurestate= "updcntrl_cellupdwaitcfg";break;
		case 101 : procedurestate= "updcntrl_oos           ";break;
		case 102 : procedurestate= "cellrescfg_started     ";break;
		case 103 : procedurestate= "celleval_phyrel        ";break;
		case 104 : procedurestate= "celleval_waiteval      ";break;
		case 105 : procedurestate= "celleval_phycfg        ";break;
		case 106 : procedurestate= "evalcntrl_started      ";break;
		case 107 : procedurestate= "siupdate_cfg           ";break;
		case 108 : procedurestate= "siupdate_cellupd       ";break;
		case 109 : procedurestate= "siupdate_delay         ";break;
		case 110 : procedurestate= "asu_config             ";break;
		case 111 : procedurestate= "smc_waitulxfer         ";break;
		case 112 : procedurestate= "smc_suspend            ";break;
		case 113 : procedurestate= "smc_idlecfg            ";break;
		case 114 : procedurestate= "smc_amcnf              ";break;
		case 115 : procedurestate= "rbsuspend_cnf          ";break;
		case 116 : procedurestate= "measctrl_waittgps      ";break;
		case 117 : procedurestate= "irhotoutran_horeq      ";break;
		case 118 : procedurestate= "irhotoutran_dchcfg     ";break;
		case 119 : procedurestate= "irhotoutran_failcnf    ";break;
		case 120 : procedurestate= "irhotoutran_inact      ";break;
		case 121 : procedurestate= "irhofrutran_checkcnfrej";break;
		case 122 : procedurestate= "irhofrutran_phycnf     ";break;
		case 123 : procedurestate= "irhofrutran_hocnf      ";break;
		case 124 : procedurestate= "irhofrutran_bprescnf   ";break;
		case 125 : procedurestate= "irhofrutran_startsync  ";break;
		case 126 : procedurestate= "irhofrutran_syncind    ";break;
		case 127 : procedurestate= "irhofrutran_dchcnf     ";break;
		case 128 : procedurestate= "irhofrutran_cellupd    ";break;
		case 129 : procedurestate= "irhofrutran_inact      ";break;
		case 130 : procedurestate= "irccofrutran_phycnf    ";break;
		case 131 : procedurestate= "irccofrutran_ccocnf    ";break;
		case 132 : procedurestate= "";break;
		case 133 : procedurestate= "irccofrutran_startsync ";break;
		case 134 : procedurestate= "irccofrutran_syncind   ";break;
		case 135 : procedurestate= "irccofrutran_dchcnf    ";break;
		case 136 : procedurestate= "irccofrutran_cellupd   ";break;
		case 137 : procedurestate= "irccofrutran_reselcfg  ";break;
		case 138 : procedurestate= "irccofrutran_fachcnf   ";break;
		case 139 : procedurestate= "irccofrutran_rachmeas  ";break;
		case 140 : procedurestate= "irccofrutran_inact     ";break;
		case 141 : procedurestate= "irccotoutran_bpcnf     ";break;
		case 142 : procedurestate= "irccotoutran_estcnf    ";break;
		case 143 : procedurestate= "irccotoutran_inact     ";break;
		case 144 : procedurestate= "irccotoutran_phyrelease ";break;
		case 145 : procedurestate= "irccotoutran_phydeact  ";break;
		case 146 : procedurestate= "irreselcntrl_reselind  ";break;
		case 147 : procedurestate= "irreselcntrl_phyratcnf ";break;
		case 148 : procedurestate= "irreselcntrl_reselcomp ";break;
		case 149 : procedurestate= "irreselcntrl_reconfig  ";break;
		case 150 : procedurestate= "irreselcntrl_cellupd   ";break;
		case 151 : procedurestate= "irreselcntrl_inact     ";break;
		case 152 : procedurestate= "irreselcntrl_phydeact  ";break;
		case 153 : procedurestate= "irreselcntrl_oos_ind   ";break;
		case 154 : procedurestate= "irreselcntrl_oos_rcfg  ";break;
		case 155 : procedurestate= "irhoccoresel_inactcomp ";break;
		case 156 : procedurestate= "wait_cnfg              ";break;
		case 157 : procedurestate= "deactl1u_start         ";break;
		case 158 : procedurestate= "deactl1u_inact         ";break;
		case 159 : procedurestate= "deactl1u_phydeact      ";break;
		case 160 : procedurestate= "cellupd_continue       ";break;
		case 161 : procedurestate= "initxfer_measrptstop   ";break;
		case 162 : procedurestate= "sigrelind_waitinitxfer ";break;
		case 163 : procedurestate= "initxfer_amcnfstop     ";break;
		case 164 : procedurestate= "connest_waitsiupdstop  ";break;
		case 165 : procedurestate= "fd_pdcpind             ";break;
		case 166 : procedurestate= "fd_waitcellupdt        ";break;
		case 167 : procedurestate= "fd_waitsiupdt          ";break;
		case 168 : procedurestate= "fd_sigrelind           ";break;
		case 169 : procedurestate= "fd_waitfchildstop      ";break;
		case 170 : procedurestate= "connrel_irredir        ";break;
		case 171 : procedurestate= "config_physync         ";break;
		case 172 : procedurestate= "scritmr_start          ";break;
		case 188 : procedurestate= "afd_res                 ";break;
		case 189 : procedurestate= "afd_sig_rel_ind       ";break;
		case 190 : procedurestate= "afd_stop_monitor_mac   ";break;
		case 191 : procedurestate= "afd_wait_on_going_prd   ";break;
		case 192 : procedurestate= "afd_nas_stop   ";break;
		default: procedurestate= "unknown";break;
	}

	return procedurestate;
}

//////////////////////////////////////////////////
function dec_ASM_URRC_UPDATE_START_REQ(iStream)
{
	var result = "";
	if (iStream.available() >= 21)
	{
		iStream.skipBytes(12);
		var cs = (iStream.readUnsignedByte() << 8) + (iStream.readUnsignedByte() << 4) + (iStream.readUnsignedByte());
		var ps = (iStream.readUnsignedByte() << 8) + (iStream.readUnsignedByte() << 4) + (iStream.readUnsignedByte());

		result += "CS=" + cs + " PS=" + ps;
	}
	else
	{
		result = return_message_length_do_not_fit(iStream.available());
	}

	return (result);
}

////////////////////////////////////////////////////////////
function dec_RABM_DATA( msg, iStream )
{
	var result = "";
	var messageName = msg.getUTF8StringValue("_Summary");

	if (iStream.available() <=0 )
	{
		result= "Message Content Empty";
		return result;
	}

	if (iStream.available() <=6 )
	{
		result= "new uplink list";
		return result;
	}

	if(messageName.equals("RABM_DATA_IND"))result = "RABM_DATA_IND | ";
	if(messageName.equals("RABM_DATA_REQ"))result = "RABM_DATA_REQ | ";

	//String decoding = getDecoding(message);
	var decoding = service.getDecodedStructValue(PanelLG, msg, "Derefrenced Pointer Data", "Pointer_0 : IP Packet");

	//byte[] msgBytes = message.getBackupContent();
	var msgBytes = getContentSafely(msg);

	var patternStr;
	var pattern;
	var matcher;
	var matchFound;

	var IPMsgType = 0;
	var IPMsgLen = 0;
	var ICMPMsgType = 0;
	var WinSize = 0;
	var Ack = 0;
	var Rst = 0;
	var Syn = 0;
	var Fin = 0;

	// Internal header length. So the first IP packet starts at msgBytes[6]
	var IntMsgHdrLen = 6;
	// Start byte position of the ICMP sequence number.
	var ICMPSeqNumIdx = 6;

	patternStr = new RegExp("Identification Number : (\\d+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		result += "IP Num = ";
		result += matcher[1];
		result += " ";
	}

	// Normal IP header is 20 bytes, but just to be sure...
	var IPVers = msgBytes[IntMsgHdrLen] >> 4;
	var IPHdrLen = msgBytes[IntMsgHdrLen] & 0x0F;
	var IPDataStartIdx = IntMsgHdrLen + IPHdrLen * 4; // 32 bits word = 4 octets

	patternStr = new RegExp("(\\d+) Higher Layer Protocol : ");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		IPMsgType = Integer.parseInt(matcher[1], 2);
		switch (IPMsgType)
		{
		case 1:
			result += "ICMP:"; break;
		case 6:
			result += "TCP:"; break;
		case 17:
			result += "UDP:"; break;
		case 111:
			result += "IPX:"; break;
		default:
			result += "Other Protocol:"; break;
		}
	}

	if (IPMsgType == 1) // ICMP messages
	{
		ICMPMsgType = msgBytes[IPDataStartIdx];
		switch (ICMPMsgType)
		{
		case 0: // Echo reply
			result += " Reply   - Seq Num = ";
			result += Integer.toString(msgBytes[IPDataStartIdx + ICMPSeqNumIdx] & 0xFF,10);
			break;
		case 8: // Echo request
			result += " Request - Seq Num = ";
			result += Integer.toString(msgBytes[IPDataStartIdx + ICMPSeqNumIdx] & 0xFF,10);
			break;
		case 3: // Destination unreachable
			result += " Destination unreachable";
			break;
		default:
			break;
		}
	}

	if (IPMsgType == 6) // TCP messages
	{
		patternStr = new RegExp("TCP Sequence Number : (\\d+)");
		var matcher = patternStr.exec(decoding);
		if (void 0 != matcher)
		{
			result += " SQ = ";
			result += matcher[1];
		}
		patternStr = new RegExp("Acknowledge Number : (\\d+)");
		var matcher = patternStr.exec(decoding);
		if (void 0 != matcher)
		{
			result += " ACK = ";
			result += matcher[1];
		}
	}

	patternStr = new RegExp("the IP packet \\(Octets\\) : (\\d+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		IPMsgLen = Integer.parseInt(matcher[1]);
		result += " Length = ";
		result += IPMsgLen;
	}


	patternStr = new RegExp("IP Source Address : (\\S+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		result += " src = ";
		result += matcher[1];
	}

	patternStr = new RegExp("Source Port : (\\d+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		IPMsgLen = Integer.parseInt(matcher[1]);
		result += "/";
		result += IPMsgLen;
	}

	patternStr = new RegExp("IP Destination Address : (\\S+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		result += " dst = ";
		result += matcher[1];
	}

	patternStr = new RegExp("Destination Port : (\\d+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		IPMsgLen = Integer.parseInt(matcher[1]);
		result += "/";
		result += IPMsgLen;
	}

	patternStr = new RegExp("Window Size in Octets : (\\d+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		WinSize = Integer.parseInt(matcher[1]);
		result += " WIN="+WinSize;
	}

	// --0----- URG : 0
	// ---1---- ACK : 1
	// ----0--- PSH : 0
	// -----0-- RST : 0
	// ------0- SYN : 0
	// -------0 FIN : 0

	patternStr = new RegExp("ACK : (\\d)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		Ack = Integer.parseInt(matcher[1]);
		result += " [A:"+Ack+"|";
	}

	patternStr = new RegExp("RST : (\\d)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		Rst = Integer.parseInt(matcher[1]);
		result += "R:"+Rst+"|";
	}

	patternStr = new RegExp("SYN : (\\d)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		Syn = Integer.parseInt(matcher[1]);
		result += "S:"+Syn+"|";
	}

	patternStr = new RegExp("FIN : (\\d)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		Fin = Integer.parseInt(matcher[1]);
		result += "F:"+Fin+"]";
	}

	return result;
	}

//////////////////////////////////////////////////////////
function dec_URRC_UPDATE_START_IND(iStream)
{
	var result = "";

	/* Skip the RAT ID */
	iStream.skipBytes(4);

	if (iStream.available() >= 6)
	{
		var cs = (iStream.readUnsignedByte() << 8) + (iStream.readUnsignedByte() << 4) + (iStream.readUnsignedByte());
		var ps = (iStream.readUnsignedByte() << 8) + (iStream.readUnsignedByte() << 4) + (iStream.readUnsignedByte());
		result += "CS=" + cs + " PS=" + ps;
	}
	else
	{
		result = return_message_length_do_not_fit(iStream.available());
	}
	return (result);
}

//////////////////////////////////////////////////
function Decode_RAT( iStream )
{
	var result = " in ";
	if (iStream.available() <=0 )
	{
		result= "Message Content Empty";
		return result;
	}

	var a;
	a = iStream.readUnsignedByte();

	switch (a)
	{
	case 1:
		result += "GSM";
		break;
	case 2:
		result += "UMTS";
		break;
	default:
		result += "Not set";
	}
	result += " RAT";
	iStream.skipBytes(3); // skip remaining bytes from RAT struct
	return result;
}

//////////////////////////////////////////////////
function Decode_reg_state( iStream )
{
	var result = "registration state: ";
	if (iStream.available() <=0 )
	{
		result= "Message Content Empty";
		return result;
	}

	var a;
	a = iStream.readUnsignedByte();

	switch (a)
	{
	case 0:
		result += "NORMAL_SERVICE";
		break;
	case 1:
		result += "REGISTRATION_FAILURE";
		break;
	case 2:
		result += "LIMITED_SERVICE";
		break;
	case 3:
		result += "NO_SERVICE";
		break;
	case 5:
		result += "SERVICE_DISABLED";
		break;
	case 6:
		result += "SERVICE_DETACHED";
		break;
	default:
		result += "Not set";
	}

	iStream.skipBytes(3); // skip remaining bytes from registration state struct
	return result;
}

//////////////////////////////////////////////////
function Decode_reg_rej_cause( iStream )
{
	var result = "";
	if (iStream.available() <=0 )
	{
		result= "Message Content Empty";
		return result;
	}

	var a;
	a = iStream.readUnsignedByte();
	iStream.skipBytes(3); // skip remaining bytes from reg_rej_cause struct
	return result;
}

//////////////////////////////////////////////////
function decodeUsimFileIdentifier(length, bytes)
{
	var decoding = new StringBuffer();

	if(bytes.length >= 13)
	{
		if(bytes[12].equals("A0"))  // AID
		{
			var aidBuffer = new StringBuffer();

			for(var x = 12, stop = bytes.length; x < stop; x++)
			{
				aidBuffer.append(bytes[x]);
			}

			var aid = aidBuffer.toString();

			if(aid.startsWith("A0000000871002"))
			{
				decoding.append(", USIM(");
			}
			else if(aid.startsWith("A0000000871004"))
			{
				decoding.append(", ISIM(");
			}
			else
			{
				decoding.append(", Unknown AID(");
			}

			decoding.append(aid).append(")");
		}
		else  // two byte identifiers
		{
			var first = true;

			var path = new StringBuffer();

			var id = new StringBuffer();

			for(var x = 12, stop = bytes.length; x < stop; x++)
			{
				id.append(bytes[x]);

				if(id.length() == 4)
				{
					if((x + 1) < stop)
					{
						if(!first)
						{
							path.append(", ");
						}

						path.append(id.toString());

						first = false;

						id = new StringBuffer(id.substring(id.length()));
						//id.delete(0, id.length()); //commented by vijay bcz not able to use delete in javascript it a keyword.
					}
				}
			}

			if(id.length() > 0)
			{
				decoding.append(", ID(").append(id.toString()).append(")");

				if(path.length() > 0)
				{
					decoding.append(", Path(").append(path.toString()).append(")");
				}
			}
		}
	}

	return(decoding.toString());
}

//////////////////////////////////////////////////
function dec_PHY_DCH_DATA_IND( msg )
{
	var result = "";
	var PayloadName = getPayloadName( msg );

	var cfn = Integer.parseInt(service.getDecodedStructValue(PanelLG, msg, PayloadName, "Param2" ));
	result = "CFN" + EQUALS + cfn; //+ " CRC bitmap" + EQUALS //+ crc_bitmap; //+ " Len = " + len;

	for (var i = 0; i < 8; i++)
	{
		var num_blocks_str = service.getDecodedStructValue(PanelLG, msg, "", "Derefrenced Pointer Data.Pointer_"+i+" : T_UMAC_TBS.T_UMAC_TBS.tb_nr" );
		if (IsEmpty( num_blocks_str ))
			break;
		var num_blocks =  Integer.parseInt(num_blocks_str);
		var tr_nr_str =  service.getDecodedStructValue(PanelLG, msg, "", "Derefrenced Pointer Data.Pointer_"+i+" : T_UMAC_TBS.T_UMAC_TBS.trch_id" );
		var crc_count_str =  service.getDecodedStructValue(PanelLG, msg, "", "Derefrenced Pointer Data.Pointer_"+i+" : T_UMAC_TBS.T_UMAC_TBS.crc" );
		var tr_nr =  tr_nr_str.charCodeAt(0);
		result += " | TrCh" +  tr_nr ;
		result += " #tb" + EQUALS + num_blocks ;

		var crc_count =  Integer.parseInt( crc_count_str );
		//int crc_count =  return_word(iStream.readUnsignedByte(), iStream.readUnsignedByte()) ;
		var crc_bitmap = java.lang.Integer.toBinaryString (crc_count);
		result += " CRC" + EQUALS + crc_bitmap;
	}

	return result;
}

//////////////////////////////////////////////////
function dec_UGDCI_AUDIO_IND(iStream)
{
	var result = "";
	var frame_type,i ;

	// Go to frame type.
	iStream.skipBytes(4);
	frame_type = iStream.readUnsignedByte() ;
	result += " frame_index:" + Integer.toHexString(frame_type >> 3).toUpperCase() + " " ;
	for (var i = 0 ; i < 4 ; i++)
	{
		result += " 0x" + Integer.toHexString(iStream.readUnsignedByte()).toUpperCase() ;
	}
	return result ;
}

//////////////////////////////////////////////////
function convert_to_negative(a)
{
	var result = (a ^ 0xFFFF) + 1;
	return result;
}

//////////////////////////////////////////////////
function formatByte(value)
{
	var result = Integer.toHexString((value < 0) ? 0 : value).toUpperCase();
	return((result.length() %2) != 0 ? "0" + result : result);
}

//////////////////////////////////////////////////
function return_word_conditionally_swapped(a, b, range)
{
	var result = a + (b << 8);
	if (result > range)
		result = (a << 8) + b;
	return result;
}

//////////////////////////////////////////////////
function convertStringToStringArray(data)
{
	var result;
	data = (data != null) ? data.replaceAll("\\s", "") : "";

	var length = data.length();

	if(length > 0)
	{
		var stop = ((length % 2) == 0) ? (length / 2) : (length - 1) / 2;

		//result = new String[stop];	 // actual code in MA AIS
		result = java.lang.reflect.Array.newInstance(java.lang.String, stop);
		// out.println("stop  = " + stop);
		// out.println("result Array and size = "  + Arrays.toString(result) + "::: " + result.length);
		for(var x = 0; x < stop; x++)
		{
			result[x] = data.substring(0, 2);
			data = data.substring(2);
		}
	}
	else
	{
		//result = new String[0];  //actual code in MA AIS
		result = java.lang.reflect.Array.newInstance(java.lang.String, 0);
	}

	return(result);
}

//////////////////////////////////////////////////
function convertByteArrayToString(bytes)
{
	if(bytes == null)
	{
		//bytes = new byte[0];  // actual code in MA AIS
		//bytes =  java.lang.reflect.Array.newInstance(java.lang.Byte, 0);
		var tmp = new BigInteger("00", 10).toByteArray();
		bytes  = Arrays.copyOfRange(tmp, 1, temp.length);//return 0 length byte array
	}

	var temp ="";
	var result = new StringBuffer();
	for(var x = 0, stop = bytes.length; x < stop; x++)
	{
		temp = Integer.toHexString(bytes[x]);

		if(temp.length() > 2)
		{
			result.append(temp.substring(temp.length() - 2));
		}
		else if(temp.length() < 2)
		{
			result.append("0").append(temp);
		}
		else
		{
			result.append(temp);
		}
	}

	return(result.toString().toUpperCase());
}

/////////////////////////////////////////////////////
function reverseBits(input)	//byte reverseBits(byte in)
{
	var out = 0;  //byte out
	for (var ii = 0 ; ii < 8 ; ii++)
	{
		var bit = new Integer((input & 1)).byteValue();  //byte bit = (byte)(in & 1);
		out = new Integer((out << 1) | bit).byteValue();  // out = (byte)((out << 1) | bit);
		input = new Integer(input >> 1).byteValue();  // in = (byte)(in >> 1);
	}
	return out;
}

/////////////////////////////////////////////////
function byteToHex(b)		// int byteToHex(byte b
{
	var i = b & 0xFF;
	return i;
}

//////////////////////////////////////////////////
/*
 * Groups the BSN2 in header type 1
 */
function get_repr_bsn2(bsn2a, bsn2b)
{
	var lBsn = 0;
	lBsn = lBsn | bsn2a;
	lBsn = lBsn | (bsn2b << 7);

	return lBsn;
}

//////////////////////////////////////////////////
/*
 * Groups the BSN1 in header type 1,2 and 3
 */
function get_repr(bsn1a, bsn1b, bsn1c)
{
	var lBsn = 0;
	lBsn = lBsn | bsn1a;
	lBsn = lBsn | (bsn1b << 2);
	lBsn = lBsn | (bsn1c << 10);

	return lBsn;
}

//////////////////////////////////////////////////
/*
 * Groups the TFI in header type 1,2,3
 */
function get_repr_tfi(tfia, tfib)
{
	var lTfi = 0;
	lTfi = lTfi | tfia;
	lTfi = lTfi | (tfib << 1);

	return lTfi;
}

//////////////////////////////////////////////////
/*
 * Decodes CPS field for Header 3
 */
function decodeCPS_H3(cps)
{
	var strLCPS;

	switch (cps)
	{
	case 0:
		strLCPS = "(MCS-4/P1)";
		break;
	case 1:
		strLCPS = "(MCS-4/P2)";
		break;
	case 2:
		strLCPS = "(MCS-4/P3)";
		break;
	case 3:
		strLCPS = "(MCS-3/P1)";
		break;
	case 4:
		strLCPS = "(MCS-3/P2)";
		break;
	case 5:
		strLCPS = "(MCS-3/P3)";
		break;
	case 6:
		strLCPS = "(MCS-3/P1) with padding (MCS-8 retr.)";
		break;
	case 7:
		strLCPS = "(MCS-3/P2) with padding (MCS-8 retr.)";
		break;
	case 8:
		strLCPS = "(MCS-3/P3) with padding (MCS-8 retr.)";
		break;
	case 9:
		strLCPS = "(MCS-2/P1)";
		break;
	case 10:
		strLCPS = "(MCS-2/P2)";
		break;
	case 11:
		strLCPS = "(MCS-1/P1)";
		break;
	case 12:
		strLCPS = "(MCS-1/P2)";
		break;
	default:
		strLCPS = "RSERVED";
		break;
	}
	return strLCPS;
}

//////////////////////////////////////////////////
/*
 * Decodes CPS field for Header 2
 */
function decodeCPS_H2(cps)
{
	var strLCPS;

	switch (cps)
	{
	case 0:
		strLCPS = "(MCS-6/P1)";
		break;
	case 1:
		strLCPS = "(MCS-6/P2)";
		break;
	case 2:
		strLCPS = "(MCS-6/P1) with padding (MCS-8 retr.)";
		break;
	case 3:
		strLCPS = "(MCS-6/P2) with padding (MCS-8 retr.)";
		break;
	case 4:
		strLCPS = "(MCS-5/P1)";
		break;
	case 5:
		strLCPS = "(MCS-5/P2)";
		break;
	default:
		strLCPS = "RSERVED";
		break;
	}
	return strLCPS;
}

//////////////////////////////////////////////////
/*
 * Decodes CPS field for Header 1
 */
function decodeCPS_H1(cps)
{
	var strLCPS;

	switch (cps)
	{
	case 0:
		strLCPS = "(MCS-9/P1 ; MCS-9/P1)";
		break;
	case 1:
		strLCPS = "(MCS-9/P1 ; MCS-9/P2)";
		break;
	case 2:
		strLCPS = "(MCS-9/P1 ; MCS-9/P3)";
		break;
	case 4:
		strLCPS = "(MCS-9/P2 ; MCS-9/P1)";
		break;
	case 5:
		strLCPS = "(MCS-9/P2 ; MCS-9/P2)";
		break;
	case 6:
		strLCPS = "(MCS-9/P2 ; MCS-9/P3)";
		break;
	case 8:
		strLCPS = "(MCS-9/P3 ; MCS-9/P1)";
		break;
	case 9:
		strLCPS = "(MCS-9/P3 ; MCS-9/P2)";
		break;
	case 10:
		strLCPS = "(MCS-9/P3 ; MCS-9/P3)";
		break;
	case 11:
		strLCPS = "(MCS-8/P1 ; MCS-8/P1)";
		break;
	case 12:
		strLCPS = "(MCS-8/P1 ; MCS-8/P2)";
		break;
	case 13:
		strLCPS = "(MCS-8/P1 ; MCS-8/P3)";
		break;
	case 14:
		strLCPS = "(MCS-8/P2 ; MCS-8/P1)";
		break;
	case 15:
		strLCPS = "(MCS-8/P2 ; MCS-8/P2)";
		break;
	case 16:
		strLCPS = "(MCS-8/P2 ; MCS-8/P3)";
		break;
	case 17:
		strLCPS = "(MCS-8/P3 ; MCS-8/P1)";
		break;
	case 18:
		strLCPS = "(MCS-8/P3 ; MCS-8/P2)";
		break;
	case 19:
		strLCPS = "(MCS-8/P3 ; MCS-8/P3)";
		break;
	case 20:
		strLCPS = "(MCS-7/P1 ; MCS-7/P1)";
		break;
	case 21:
		strLCPS = "(MCS-7/P1 ; MCS-7/P2)";
		break;
	case 22:
		strLCPS = "(MCS-7/P1 ; MCS-7/P3)";
		break;
	case 23:
		strLCPS = "(MCS-7/P2 ; MCS-7/P1)";
		break;
	case 24:
		strLCPS = "(MCS-7/P2 ; MCS-7/P2)";
		break;
	case 25:
		strLCPS = "(MCS-7/P2 ; MCS-7/P3)";
		break;
	case 26:
		strLCPS = "(MCS-7/P3 ; MCS-7/P1)";
		break;
	case 27:
		strLCPS = "(MCS-7/P3 ; MCS-7/P2)";
		break;
	case 28:
		strLCPS = "(MCS-7/P3 ; MCS-7/P3)";
		break;
	default:
		strLCPS = "RSERVED";
		break;
	}

	return strLCPS;
}

//////////////////////////////////////////////////
function mac_timer(index)
{
	var res = "unknown timer";

	switch (index)
	{
	case 0:
		res = "T3122";
		break;
	case 1:
		res = "T3134";
		break;
	case 2:
		res = "T3142";
		break;
	case 3:
		res = "T3164";
		break;
	case 4:
		res = "T3166";
		break;
	case 5:
		res = "T3168";
		break;
	case 6:
		res = "T3170";
		break;
	case 7:
		res = "T3172";
		break;
	case 8:
		res = "T3174";
		break;
	case 9:
		res = "T3176";
		break;
	case 10:
		res = "T3180";
		break;
	case 11:
		res = "T3184";
		break;
	case 12:
		res = "T3186";
		break;
	case 13:
		res = "T3188";
		break;
	case 14:
		res = "T3190";
		break;
	case 15:
		res = "T3192";
		break;
	case 16:
		res = "T3206";
		break;
	}

	return res;
}

//////////////////////////////////////////////////
/**
 * mac_state :
 */
function mac_state(index)
{
	var res = "";

	switch (index)
	{
	case 1:
		res = "MAC_SM_GLOBAL_IDLE";
		break;
	case 2:
		res = "MAC_SM_CS_ESTABLISHMENT";
		break;
	case 3:
		res = "MAC_SM_GLOBAL_WORKING";
		break;
	case 4:
		res = "MAC_SM_UPLINK_IDLE";
		break;
	case 5:
		res = "MAC_SM_UPLINK_WAITING_FOR_INITIAL_ASSIGNMENT";
		break;
	case 6:
		res = "MAC_SM_UPLINK_CONTENTION_RESOLUTION_ACTIVE";
		break;
	case 7:
		res = "MAC_SM_UPLINK_TRANSFER";
		break;
	case 8:
		res = "MAC_SM_UPLINK_RLC_RELEASE";
		break;
	case 9:
		res = "MAC_SM_UPLINK_MAC_RELEASE";
		break;
	case 10:
		res = "MAC_SM_DOWNLINK_IDLE";
		break;
	case 11:
		res = "MAC_SM_DOWNLINK_ESTABLISHMENT";
		break;
	case 12:
		res = "MAC_SM_DOWNLINK_TRANSFER";
		break;
	case 13:
		res = "MAC_SM_DOWNLINK_MAC_RELEASE";
		break;
	case 14:
		res = "MAC_SM_DOWNLINK_RLC_RELEASE";
		break;
	}
	return res;
}

//////////////////////////////////////////////////
/** ******This function Calculates no of bits to be read */
function bits_Calculator(no_of_freq)  //return int
{
	N = 0;
	if (no_of_freq > 16)
	{
		// the values 17 to 31 indicating, that there is no SC included
		// see 44.018 Table 9.1.54.1 (Measurement Information)
		No_Of_Bits = N;
		//System.out.println("NO_Of_Bits=" + No_Of_Bits);
		return N;
	}

	var Var = 10, temp = 1, N = 0, n = 0;
	for (var i = 1; i <= 18; i++)
	{
		for (var j = 1; j <= temp; j++)
		{
			N = N + Var;
			n++;
			if (n == no_of_freq)
				break;
		}
		temp = temp * 2;
		Var = Var - 1;
		if (n == no_of_freq)
			break;
	}
	No_Of_Bits = N;
	//System.out.println("NO_Of_Bits=" + No_Of_Bits);
	return N;
}

//////////////////////////////////////////////////
/** **********Frequency Calculator*********** */
/*
  See 44.018 Annex J.5 Decoding
  The Algorithem in 44.018 10.5.2.13.3 Range 1024 format looks to be wrong
  In our sources we use a similar alg. to J.5 see /vobs/ms-src/text/ms_decode_freq.c

  INDEX : 1..W'SIZE; RANGE : INTEGER;
  N : INTEGER;
  begin
    for K in 1..W'SIZE loop
      INDEX := K;
      RANGE := ORIGINAL_RANGE / GREATEST_POWER_OF_2_LESSER_OR_EQUAL_TO(INDEX);
      N := W(INDEX) - 1;

      while INDEX > 1 loop
        RANGE := 2*RANGE + 1;
        J = GREATEST_POWER_OF_2_LESSER_OR_EQUAL_TO(INDEX).

        if 2*INDEX < 3*GREATEST_POWER_OF_2_LESSER_OR_EQUAL_TO(INDEX)
          INDEX := INDEX - GREATEST_POWER_OF_2_LESSER_OR_EQUAL_TO(INDEX)/2;
          N := (N + W(INDEX) - 1 + (RANGE-1)/2 + 1) mod RANGE;
        else
          INDEX := INDEX - GREATEST_POWER_OF_2_LESSER_OR_EQUAL_TO(INDEX);
          N := (N + W(INDEX) - 1 + 1) mod RANGE;
        end if;
      end loop;
      F(K) := N;
    end loop;
  end;
*/
function frequency_Calculator(W)  //int[] W
{
	var output = new StringBuffer();
	var INDEX;
	var J;
	var N;
	var ORIGINAL_RANGE;
	var RANGE;
	var F = new Array(17)//new int[17];
	var K;

	// if (IpcMessage.displayDataHex)
	// output.append("Scramblingcode,Diversity(Hex)=");
	// else
	output.append("Scramblingcode,Diversity(Dec)=");

	ORIGINAL_RANGE = 1023;
	//System.out.println("K = " + K + "---------------------");
	for (K = 1; K < No_of_cells + 1; K++)
	{
		INDEX = K;
		RANGE = ORIGINAL_RANGE / g_p_2(INDEX);
		N = W[K];

		//System.out.println("K = " + K + "---------------------");
		//System.out.println("N=" + N);
		//System.out.println("RANGE=" + RANGE);
		while (INDEX > 1)
		{
			//System.out.println("  while--------");
			RANGE = 2 * RANGE +1;/////////////////////////////////////////////
			J = g_p_2(INDEX);/////////////////////////////////////////////////
			if (2 * INDEX < 3 * J)
			{
				INDEX = INDEX - J / 2;/////////////////////////////////////////////
				N = SMOD ((N + W[INDEX] - 1 + (RANGE-1)/2 + 1), RANGE);//////////////////
			}
			else
			{
			INDEX = INDEX - J;////////////////////////////////////////////////
			N = SMOD((N + W[INDEX] - 1 + 1) , RANGE);///////////////////////////////
			}
		}
		F[K] = N;

		// if (IpcMessage.displayDataHex)
		// { //hex display
		// output.append("|");
		// output.append(Integer.toHexString(N & 0x1FF).toUpperCase());
		// output.append(",");
		// output.append(Integer.toHexString(N >> 9   ).toUpperCase());
		// }
		// else
		// {
		//dec display
		output.append("|");
		output.append(Integer.toString(N & 0x1FF));
		output.append(",");
		output.append(Integer.toString(N >> 9   ));
		// }

	}
	//System.out.println("output=" + output);
	return output.toString();
}

//////////////////////////////////////////////////
function SMOD (n, m)
{
	var help;

	help = n % m;
	if (help == 0)
		return m;
	else
		return help;
}

//////////////////////////////////////////////////
function g_p_2(x)
{
	var pow_2 = 1;
	while (pow_2 <= x)
		pow_2 = pow_2 * 2;
	return pow_2 / 2;
}

//////////////////////////////////////////////////
/** *******Message decoding in ********* */
function dec_FDD_CELL_INFO(stringBuf)
{
	stringBuf = new StringBuffer(stringBuf);
	var stringToReturn = new StringBuffer();
	var index1 = (stringBuf.indexOf("NR_OF_FDD_CELLS (HEX):= "));
	var index2 = (stringBuf.indexOf("FDD_CELL_INFORMATION_Field (HEX):= "));
	var res1 = stringBuf.substring(index1 + 24, index1 + 26);

	//System.out.println(stringBuf);
	//System.out.println("NR_OF_FDD_CELLS (HEX):=" + res1);

	var BYTE = 0;
	try {
		No_of_cells = Integer.parseInt(res1,16);
		//System.out.println(No_of_cells);
	} catch(e) {
		logException( e );
		stringToReturn.append("(Error in script, function dec_FDD_CELL_INFO, Exception = ");
		stringToReturn.append(e);
		stringToReturn.append(")");
		return stringToReturn.toString();
	}

	//No_of_cells=no_of_freq; // Setting Global Variable for further use.
	var N = bits_Calculator(No_of_cells);
	var test_str = "";
	if (N > 0)
	{
		if (N % 8 > 0)
		{
			BYTE = N / 8 + 1;
		}
		else
			BYTE = N / 8;
		var string_length = BYTE * 2 + (BYTE - 1);
		var res2 = stringBuf.substring(index2 + 35, index2 + string_length + 35);
		//String res2 ="06 47 fe 01";
		//String res2="06 47 fe 01";
		var indx = 0;
		for (var i = 0; i < res2.length(); i++) ///This should be global////
		{
			if (res2.charAt(i) != ' ')
			{
				test_str = test_str + res2.charAt(i);
			}
		}
	}
	//System.out.println("CSN HEX ARRAY=" + test_str);
	return new String(test_str);
}

//////////////////////////////////////////////////
/**
 * Function to return general layer 3 plus T3212
 * basically like dec_layer3 but addinf T3212
 * Author   Carlo F
 * Date     09.11.05
 * @param   string from getDecoding(message);
 * @return  title string
 */
function dec_layer3_SIB (decoding)
{
	decoding = new String(decoding);
	var title = "";
	var tmp = dec_layer3(decoding);

	if(tmp.equals("System Information Type 1"))
		title += "SI1";
	else if(tmp.equals("System Information Type 2"))
		title += "SI2";
	else if(tmp.equals("System Information Type 2bis"))
		title += "SI2bis";
	else if(tmp.equals("System Information Type 2ter"))
		title += "SI2ter";
	else if(tmp.equals("System Information Type 2quater"))
		title += "SI2qua";
	else if(tmp.equals("System Information Type 3"))
		title += "SI3";
	else if(tmp.equals("System Information Type 4"))
		title += "SI4";
	else if(tmp.equals("System Information Type 7"))
		title += "SI7";
	else if(tmp.equals("System Information Type 8"))
		title += "SI8";
	else if(tmp.equals("System Information Type 9"))
		title += "SI9";
	else if(tmp.equals("System Information Type 13"))
		title += "SI13";
	else if(tmp.equals("System Information Type 16"))
		title += "SI16";
	else if(tmp.equals("System Information Type 17"))
		title += "SI17";
	else if(tmp.equals("System Information Type 18"))
		title += "SI18";
	else if(tmp.equals("System Information Type 20"))
		title += "SI20";
	else
		title += tmp;

	//      title += dec_layer3 (decoding);
	var patternStr = new RegExp("T3212:  Timeout value : (\\d+)");
	var matcher = patternStr.exec(decoding);
	if (void 0 != matcher)
	{
		title += " T3212=";
		title += matcher[1];
	}
	return title;
}


//////////////////////////////////////////////////
function get_list_sn(a, b)
{
	var result = ((a & 0x00F0) >> 4) * 256 + (a & 0x000F) * 16 + ((b & 0x00F0) >> 4);
	return result;
}


//////////////////////////////////////////////////
function get_sn( a, b )
{
	var tmpA = parseInt( convert_uint2str( a ) );
	var tmpB = parseInt( convert_uint2str( b ) );
	var tmpR = 0;
	tmpR = (tmpA & 0x00FF) * 256 + tmpB;
	return tmpR;
}

//////////////////////////////////////////////////
function get_int( a, b, c, d )
{
	var tmpA = parseInt( convert_uint2str( a ) );
	var tmpB = parseInt( convert_uint2str( b ) );
	var tmpC = parseInt( convert_uint2str( c ) );
	var tmpD = parseInt( convert_uint2str( d ) );
	var tmpR = 0;

	tmpR =  tmpA & 0x00FF;
	tmpR = (tmpR * 256) + (tmpB & 0x00FF);
	tmpR = (tmpR * 256) + (tmpC & 0x00FF);
	tmpR = (tmpR * 256) + (tmpD & 0x00FF);

	return tmpR;
}

//////////////////////////////////////////////////
function return_message_length_do_not_fit(len)
{
	//len = current length of the message
	if (len == 0)
	{
	return "no decoding for this message because the length is 0. " +
			"(It looks like that the mobile deleted the payload of this signal " +
			"because the bandwidth was not high enough to send the payload) ";
	}
	else
	{
	return "no decoding for this message because the length do not fit (" +
			Integer.toString(len) +
			"). If you like that this version of this message is decoded " +
			"please change the Additional Inline Script (AIS). " +
			"(It looks like that the definition of the SDL Signal changed) ";
	}
}

//////////////////////////////////////////////////
function string2int(aNumber)
{
	aNumber = stripLiteralValue(aNumber);//stripLiteralText(aNumber);
	var result = -1;

	//if(IpcMessage.displayDataHex)
	// result = Long.parseLong(aNumber.trim(), 16);
	//else
	result = Integer.parseInt(aNumber);

	return result;
}

//////////////////////////////////////////////////
function mySplit( aText, DelStart, DelEnd )
{
	var i;

	if (void 0 != DelStart)
		{
		delimiters = new String( DelStart );
		for (i = 0; i < delimiters.length; i++)
			{
			var subChunks = aText.indexOf(delimiters[i]);
			if (subChunks != -1)
				aText = aText.substr( subChunks+1 );
			}
		}

	if (void 0 != DelEnd)
		{
		delimiters = new String( DelEnd );
		for (i = 0; i < delimiters.length; i++)
			{
			var subChunks = aText.indexOf(delimiters[i]);
			if (subChunks != -1)
				aText = aText.substr( 0, subChunks );
			}
		}

	return aText ;
}

//////////////////////////////////////////////////
function stripLiteralValue(aText)
{
	try {
		aText = new String(aText);
		var patternStr = new RegExp(".*[\\(\\{\\[][\\sa-fA-F0-9-]+[\\)\\}\\]]");
		var matcher = patternStr.exec(aText);
		if (void 0 != matcher)
		{
			aText = matcher[0];
			var ex = "[\\{\\(\\[\\)\\}\\]]";
			var regex = new RegExp(ex, 'g');
			aText = aText.split( regex )[1];
		}

		var patternStr = new RegExp(".*[\\(\\{][0-9-]+[\\)\\}]");
		var matcher = patternStr.exec(aText);
		if (void 0 != matcher)
		{
			aText = matcher[0];
			var ex = "[\\{\\(\\)\\}]";
			var regex = new RegExp(ex, 'g');
			aText = aText.split( regex )[1];
		}
		return aText.replace( " ", "" );
	} catch (e) {
		logException(e);
	}
	return "";
}

//////////////////////////////////////////////////
function stripLiteralText(aText)
{
	aText = new String(aText);
	var patternStr = new RegExp(".*[\\(\\{\\[][a-fA-F0-9x]+[\\)\\}\\]]");	// && IpcMessage.displayDataHex
	var matcher = patternStr.exec(aText);
	if (void 0 != matcher)
	{
		aText = matcher[0];
		var ex = "[\\(\\{\\[]";
		var regex = new RegExp(ex, 'g');
		aText = aText.split( regex )[0];
	}

	var patternStr = new RegExp(".*[\\(\\{][0-9]+[\\)\\{]");	// && IpcMessage.displayDataHex
	var matcher = patternStr.exec(aText);
	if (void 0 != matcher)
	{
		aText = matcher[0];
		var ex = "[\\(\\{]";
		var regex = new RegExp(ex, 'g');
		aText = aText.split( regex )[0];
	}

	return aText.replace( " ", "" );
}
//////////////////////////////////////////////////
function stripQuotes(aText)
{
	var variable = new String( aText );
	var reg = new RegExp("\"", "g");
	return variable.replace( reg, "");
}

function stripQuotes_new(aText)
{
	var variable = new String( aText );
	var reg = new RegExp("[[]", "g");
	//var arr = variable.exec(reg);
	//return RegExp.leftContext;
	//return variable.split("\[",8);
	return variable.replace( RegExp.rightContext, "");
}
//////////////////////////////////////////////////
function dec_EGPRS_Channel_Quality_Report(stringBuffer)
{
	return getSubStringValue3Args(stringBuffer, "EGPRS_Channel_Quality_Report", "EChQualRep"); //getSubStringValue
}

//////////////////////////////////////////////////
function dec_DOWNLINK_TFI(stringBuffer, stringToMatch, stringToWrite)
{
	return getSubStringValue5Args(stringBuffer, stringToMatch, stringToWrite, 21, 23); //getSubStringValue ----->getSubStringValue5Agrs
}

//////////////////////////////////////////////////
function displayStringVector()
{
	var stringToReturn = "";
	var vectorSize = stringVector.size();

	if (vectorSize == 1)
	{
		var str = getStringAtVectorIndex(0);
		if (!str.equals(DECI))
			stringToReturn = str;
	}
	else
	if (vectorSize > 1)
	{
		for (var i = 0; i < vectorSize - 2; i++)
			stringToReturn += getStringAtVectorIndex(i) + TYPE_SEP;
		stringToReturn += getStringAtVectorIndex(vectorSize - 2) + "  ";
		stringToReturn += getStringAtVectorIndex(vectorSize - 1);
	}

	return stringToReturn;
}

//////////////////////////////////////////////////
function getStringAtVectorIndex(index)
{
	var stringToReturn = "";
	try
	{
		stringToReturn = stringVector.get(index);
		//script.log("stringToReturn"+stringToReturn);
	} catch(e) {
		logException( e );
		stringToReturn = "";
	}
	return stringToReturn;
}

//////////////////////////////////////////////////
function dec_DOWNLINK_TFI(stringBuffer, stringToMatch, stringToWrite)
{
	return getSubStringValue5Args(stringBuffer, stringToMatch, stringToWrite, 21, 23);  //getSubStringValue-------->getSubStringValue5Args
}

//////////////////////////////////////////////////
function dec_Channel_Request_Description(stringBuffer)
{
	return getSubStringValue3Args(stringBuffer, "Channel_Request_Description", "ChReq"); //getSubStringValue
}

//////////////////////////////////////////////////
function getSubStringValue4Args(stringBuffer, stringToWrite, beginIndex, endIndex)  //getSubStringValue ---->getSubStringValue4Args
{
	return stringToWrite + getDecValueFromString3Agrs(stringBuffer, beginIndex, endIndex);  //  //getDecValueFromString
}

//////////////////////////////////////////////////
function getSubStringValue3Args(stringBuffer, stringToMatch, stringToWrite)   //getSubStringValue(stringBuffer, stringToMatch, stringToWrite) changed to --->>getSubStringValue3Args
{
	var stringToReturn = "";
	var subStringIndex = 0;

	try
	{
		subStringIndex = stringBuffer.indexOf(stringToMatch);
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	if (subStringIndex > 0)
		return stringToWrite;

	return stringToReturn;
}

//////////////////////////////////////////////////
function addToStringVector(stringToAdd)
{
try{
	if (!new String(stringToAdd).equals(""))
		try
		{
			stringVector.add(stringToAdd);
		}
		catch (e if e.javaException instanceof java.lang.UnsupportedOperationException)
		{
			logException( e );
		}
		catch (e if e.javaException instanceof java.lang.ClassCastException)
		{
			logException( e );
		}
		catch (e if e.javaException instanceof java.lang.NullPointerException)
		{
			logException( e );
		}
		catch (e if e.javaException instanceof java.lang.IllegalArgumentException)
		{
			logException( e );
		}
		} catch(e) {
		logException( e );

	}
}

//////////////////////////////////////////////////
function getSubStringValue5Args(stringBuffer, stringToMatch, stringToWrite, firstOffset, secondOffset) //getSubStringValue -->getSubStringValue5Agrs
{
	var stringToReturn = "";
	var subStringIndex = 0;

	try
	{
		subStringIndex = stringBuffer.indexOf(stringToMatch);

		if (subStringIndex > 0)
		{
			stringToReturn += stringToWrite;
			stringToReturn += getDecValueFromString3Agrs(stringBuffer, (subStringIndex + firstOffset), (subStringIndex + secondOffset) );  //getDecValueFromString
		}
	} catch(e) {
		logException( e );
		subStringIndex = -1;
	}

	return stringToReturn;
}

//////////////////////////////////////////////////
function getDecValueFromString3Agrs(stringBuffer, beginIndex, endIndex)  //getDecValueFromString(stringBuffer, beginIndex, endIndex) changed to ------>> getDecValueFromString3Agrs((stringBuffer, beginIndex, endIndex))
{
	try
	{
		var   value = java.lang.Integer.valueOf(stringBuffer.substring(beginIndex, endIndex), 16).intValue();
		return value;
	} catch(e) {
		logException( e );
		return -1;
	}
}

//////////////////////////////////////////////////
function clearStringVector()
{
	try
	{
		if (stringVector == undefined)
			stringVector = new Array();
		else
		{
			stringVector.clear();
		}
	} catch(e) {
		logException( e );
		stringVector = new Array();
	}
}

//////////////////////////////////////////////////
function dec_ACK_NACK_DESCRIPTION(stringBuffer)
{
	var subStringIndex = 0;
	var endIndex = 0;
	var stringToReturn = "";
	var faiValue = -1;

	try
	{
		stringToReturn += getSubStringValue5Args(stringBuffer, "STARTING_SEQUENCE_NUMBER", "SSN=", 33, 35);  //getSubStringValue
		try
		{
			subStringIndex = stringBuffer.indexOf("FINAL_ACK_INDICATION");
		} catch(e) {
			logException( e );
			subStringIndex = -1;
		}
		if (subStringIndex > 0)
			faiValue = getDecValueFromString3Agrs(stringBuffer, subStringIndex + 29, subStringIndex + 31);  //  //getDecValueFromString
		if (faiValue == 1)
			stringToReturn += TYPE_SEP + "FAI=1";
		try
		{
			subStringIndex = stringBuffer.indexOf("RECEIVED_BLOCK_BITMAP");
		} catch(e) {
			logException( e );
			subStringIndex = -1;
		}
		if (subStringIndex > 0)
		{
			try
			{
				endIndex = stringBuffer.indexOf("\n", subStringIndex);
			} catch(e) {
				logException( e );
				endIndex = -1;
			}
			var intValue = getDecValueFromString3Agrs(stringBuffer, endIndex - 2, endIndex);  // //getDecValueFromString
			if (intValue == 0 && (endIndex - subStringIndex) <= 31)
				stringToReturn += TYPE_SEP + "NoBM";
			else
			{
				var bitMapString = getBitMapFromHex(stringBuffer, subStringIndex + 30, endIndex - 1);
				bitMapString = removeMostSignificantZeros(bitMapString);
				stringToReturn += TYPE_SEP + "BitMap:" + bitMapString + TYPE_SEP
								+ "UnAckBl=" + unAckedBlockNumber(bitMapString, false);
			}
		}
	} catch(e) {
		logException( e );
		stringToReturn = "";
	}
	return stringToReturn;
}

//////////////////////////////////////////////////
function unAckedBlockNumber(binaryString, isEPDAN)
{
	var count = 0;

	if (isEPDAN)
		count = 1;

	for (var i = 0; i < binaryString.length; i++)
		if (binaryString.charAt(i) == '0')
			count++;
	return count;
}

//////////////////////////////////////////////////
function removeMostSignificantZeros(binaryString)
{
	while (true)
	{
		if (strStartsWith(binaryString,"0"))
			binaryString = new String(binaryString).substring(1);
		else
			return binaryString;
	}
}

//////////////////////////////////////////////////
function getBitMapFromHex(stringBuffer, beginIndex, endIndex)
{
	var stringToReturn = "";
	for (var i = beginIndex; i < endIndex;)
	{
		stringToReturn += formatInBinaryForm(Integer.toBinaryString(getDecValueFromString3Agrs(stringBuffer, i, i + 2) ));	// //getDecValueFromString
		i += 3;
	}
	return stringToReturn;
}

//////////////////////////////////////////////////
function formatInBinaryForm(stringToFormat)
{
	var zeroString = "0";

	if(stringToFormat.length >= 8)
		return stringToFormat;

	while (stringToFormat.length < 8)
	{
		stringToFormat = zeroString.concat(stringToFormat);
	}
	return stringToFormat;
}

//////////////////////////////////////////////////
function getDecValueFromString(stringToConvert)
{
	try {
		return java.lang.Integer.valueOf(stringToConvert, 16).intValue();
	} catch(e) {
		logException( e );
	return -1;
	}
}


//////////////////////////////////////////////////
function displayReceivedBlock(stringBuffer)
{
	var stringToReturn = "";

	try
	{
		var subStringIndex = stringBuffer.indexOf("RECEIVED_BLOCK_BITMAP");
		if (subStringIndex > 0)
		{
			var endIndex = stringBuffer.indexOf("\n", subStringIndex);
			if (endIndex > 0)
			{
				var intValue = getDecValueFromString3Agrs(stringBuffer, endIndex - 2, endIndex); //getDecValueFromString

				if (intValue == 0 && (endIndex - subStringIndex) <= 32)
					stringToReturn += TYPE_SEP + "NoBM";
				else
				{
					var bitMapString = getBitMapFromHex(stringBuffer, subStringIndex + 30, endIndex - 1);
					bitMapString = removeMostSignificantZeros(bitMapString);
					stringToReturn += TYPE_SEP + "RECEIVED_BLOCK:" + bitMapString
									+ TYPE_SEP + "UnAckBl=" + unAckedBlockNumber(bitMapString, false);
				}
			}
		}
	} catch(e) {
		logException( e );
	}

	return stringToReturn;
}

//////////////////////////////////////////////////
function swapbyte_return_word(a, b)
{
	var result = a + (b<<8);
	return result;
}

//////////////////////////////////////////////////
function swapbyte_return_long(a, b, c, d)
{
	var result = a + (b<<8) + (c<<16) + (d<<24);
	return result;
}

//////////////////////////////////////////////////
function process__Timer( msg )
{
	var TimerType = getLOG_TYPE( msg );

	return convert_Timer_to_str( TimerType );
}

//////////////////////////////////////////////////
function process__CORE_DUMP( msg )
{
	var PayloadName = getPayloadName( msg );

	var filename_string= service.getDecodedStructValue("STRUCTURED_DATA", msg, PayloadName, "filename");
	var line_string= service.getDecodedStructValue("STRUCTURED_DATA", msg, PayloadName, "line");
	return "File is" + filename_string +"; Line=" + line_string;
}

//////////////////////////////////////////////////
function updateColumn_MID0_Ver_SW( msg )
{
	var result = "";

	var versionStr = msg.getValue("_Decoder Message");
	try {
		versionStr = versionStr.replaceAll("\\s","");
		result = hex_to_string(versionStr);
	} catch ( e ) {
		logException( e );
	}

	return result;
}

//////////////////////////////////////////////////
function updateColumn_MID0_Trap( msg )
{
	var filename = service.getDecodedStructValue(PanelLG, msg, "", "Trap exception.SW data dump.Filename");
	var line   = service.getDecodedStructValue(PanelLG, msg, "", "Trap exception.SW data dump.line");

	return filename + " / " + line;
}

//add for TDSCDMA l1-----start
////////////////////////////////////////////////////////////////////////----------------est_req_SM05025943
function process__L1ETD_IRAT_SERVICE_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var Service = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1ETD_IRAT_SERVICE_REQ.service")));
	Service = Service.replace("L1ETD_IPC_SERVICE_", "");
	return Service;
}

////////////////////////////////////////////////////////////////////////----------------581
function process__L1GTD_IRAT_SERVICE_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var Service = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1GTD_IRAT_SERVICE_REQ.service")));
	Service = Service.replace("L1GTD_IPC_SERVICE_", "");
	return Service;
}

////////////////////////////////////////////////////////////////////////----------------est_req_sms05025943
function process__L1TDE_IRAT_SERVICE_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var Service = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1TDE_IRAT_SERVICE_REQ.service")));
	Service = Service.replace("L1TDE_IPC_SERVICE_", "");
	return Service;
}

////////////////////////////////////////////////////////////////////////----------------581
function process__L1TDG_IRAT_SERVICE_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var Service = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1TDG_IRAT_SERVICE_REQ.service")));
	Service = Service.replace("L1TDG_IPC_SERVICE_", "");
	return Service;
}

////////////////////////////////////////////////////////////////////////-------------------581 457
function process__L1ETD_MASTER_RAT_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var master_RAT = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1ETD_MASTER_RAT_REQ.master_RAT")));
	master_RAT = master_RAT.replace("L1TD_IPC_RAT_", "");
	return master_RAT;
}

////////////////////////////////////////////////////////////////////////-------------------581 457
function process__L1GTD_MASTER_RAT_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var master_RAT = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1GTD_MASTER_RAT_REQ.master_RAT")));
	master_RAT = master_RAT.replace("L1TD_IPC_RAT_", "");
	return master_RAT;
}

////////////////////////////////////////////////////////////////////////-------------------est_req_SMS05025943
function process__L1TDE_MASTER_RAT_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var master_RAT = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1TDE_MASTER_RAT_REQ.master_RAT")));
	master_RAT = master_RAT.replace("L1TD_IPC_RAT_", "");
	return master_RAT;
}

////////////////////////////////////////////////////////////////////////-------------------581
function process__L1TDG_MASTER_RAT_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var master_RAT = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelLG, msg, PayloadName, "P_HLS_L1_IRAT_IND.L1TDG_MASTER_RAT_REQ.master_RAT")));
	master_RAT = master_RAT.replace("L1TD_IPC_RAT_", "");
	return master_RAT;
}

////////////////////////////////////////////////////////////////////////---------------est_req_SMS05025943
function process__L1ETD_IRAT_CELL_LIST_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1ETD_IRAT_CELL_LIST_REQ.";

	var result = "";
	var nof_earfcns_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"nof_earfcns"));
	result = "EARFCNs:" + nof_earfcns_string;

	var nof_earfcns_int = parseInt(nof_earfcns_string);
	if (nof_earfcns_int > 8)//L1TD_IPC_EUTRAN_MAX_NOF_EARFCNS=8
		return "--";

	for(var i=0; i<nof_earfcns_int; i++)
	{
		var measure_earfcns = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"measure_earfcns :  8[0x0008] numbers.[000"+i+"]"));
		result += " EARFCN:" + measure_earfcns;

		var measure_bandwidth = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"measure_bandwidth :  8[0x0008] numbers.[000"+i+"]")));
		measure_bandwidth = measure_bandwidth.replace("L1ETD_IPC_NRB_", "");
		result += " BandWidth:" + measure_bandwidth;
	}

	var measure_mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cmd.mode")));
	measure_mode = measure_mode.replace("L1ETD_IPC_IRAT_MEAS_MODE_", "");
	result += " MeasMode:" + measure_mode;

	return result;
}

////////////////////////////////////////////////////////////////////////---------------est_req_SMS05025943
function process__L1TDE_UTRAN_IRAT_CELL_LIST_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDE_UTRAN_IRAT_CELL_LIST_REQ.";

	var result = "";
	var nof_uarfcns_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"nof_uarfcns"));
	var result = "UARFCNs:" + nof_uarfcns_string;

	var nof_uarfcns_int = parseInt(nof_uarfcns_string);
	if (nof_uarfcns_int > 16)	//L1TD_IPC_TDSCDMA_MAX_NOF_UARFCNS=16
		return "--";

	for(var i=0; i<nof_uarfcns_int; i++)
	{
		var measure_uarfcns = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"measure_uarfcns : 16[0x0010] numbers.[000"+i+"]"));
		result += " " + measure_uarfcns;
	}

	var measure_mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cmd.mode")));
	measure_mode = measure_mode.replace("L1TDE_IPC_IRAT_MEAS_MODE_", "");
	result += " MeasMode:" + measure_mode;

	return result;
}

////////////////////////////////////////////////////////////////////////---------------idle CSFB2GSM didn't return to LTE      decorder error
function process__L1TDE_GERAN_IRAT_CELL_LIST_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDE_GERAN_IRAT_CELL_LIST_REQ.";
	var result = "";
/*
	var nof_arfcns_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName + "nof_arfcns"));
	result = "ARFCNs:" + nof_arfcns_string;

	var nof_arfcns_int = parseInt(nof_arfcns_string);
	if (nof_arfcns_int > 16) //L1TD_IPC_MAX_NOF_GERAN_NCELL=32
	    return "--";

	for(var i=0; i<nof_arfcns_int; i++)
	{
	    var measure_arfcns = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName,  MsgName + "measure_arfcns : 16[0x0010] numbers.[000"+i+"]"));
		result += " " + measure_arfcns;
	}

	var measure_mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName,  MsgName + "cmd.mode")));
	measure_mode = measure_mode.replace("L1TDE_IPC_IRAT_MEAS_MODE_", "");
	result += " MeasMode:" + measure_mode;
*/
	return result;
}

////////////////////////////////////////////////////////////////////////---------------581
function process__L1TDG_UTRAN_IRAT_CELL_LIST_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDG_UTRAN_IRAT_CELL_LIST_REQ.";

	var result = "";
	var nof_uarfcns_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"nof_uarfcns"));
	var result = "UARFCNs:" + nof_uarfcns_string;

	var nof_uarfcns_int = parseInt(nof_uarfcns_string);
	if (nof_uarfcns_int > 16)//L1TD_IPC_TDSCDMA_MAX_NOF_UARFCNS=16
		return "--";

	for(var i=0; i<nof_uarfcns_int; i++)
	{
		var measure_uarfcns = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"measure_uarfcns : 16[0x0010] numbers.[000"+i+"]"));
		result += " " + measure_uarfcns;
	}

	var measure_mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cmd.mode")));
	measure_mode = measure_mode.replace("L1TDG_IPC_IRAT_MEAS_MODE_", "");
	result += " MeasMode:" + measure_mode;

	return result;
}

///////////////////////////////////////////////////////////////////////************Have no trace to test and verify
function process__L1ETD_IRAT_MEAS_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1ETD_IRAT_MEAS_REQ.param.";
	var result = "";
/*
	var MeasMode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"mode")));
	MeasMode = MeasMode.replace("L1ETD_IPC_IRAT_MEAS_MODE_", "");
	return "MeasMode:" + MeasMode;
*/
	return result;
}

////////////////////////////////////////////////////////////////////////--------------est_req_SMS05025943
function process__L1TDE_UTRAN_IRAT_MEAS_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDE_UTRAN_IRAT_MEAS_REQ.param.";
	var result = "";

	var MeasMode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"mode")));
	MeasMode = MeasMode.replace("L1TDE_IPC_IRAT_MEAS_MODE_", "");
	return "MeasMode:" + MeasMode;
}

////////////////////////////////////////////////////////////////////////----------idle CSFB2GSM didn't return to LTE
function process__L1TDE_GERAN_IRAT_MEAS_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDE_GERAN_IRAT_MEAS_REQ.param.";
	var result = "";

	var MeasMode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"mode")));
	MeasMode = MeasMode.replace("L1TDE_IPC_IRAT_MEAS_MODE_", "");
	return "MeasMode:" + MeasMode;
}

////////////////////////////////////////////////////////////////////////************Have no trace to test and verify
function process__L1TDG_UTRAN_IRAT_MEAS_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDG_UTRAN_IRAT_MEAS_REQ.param.";
	var result = "";
/*
	var MeasMode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"mode")));
	MeasMode = MeasMode.replace("L1TDG_IPC_IRAT_MEAS_MODE_", "");
	return "MeasMode:" + MeasMode;
*/
	return result;
}

////////////////////////////////////////////////////////////////////////--------------est_req_SMS05025943
function process__L1ETD_IRAT_MEAS_REPORT_IND( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1ETD_IRAT_MEAS_REPORT_IND.";
	var result = "";

	var IRAT_earfcn_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"earfcn"));
	result = "EARFCN:" + IRAT_earfcn_string;

	var nof_results_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"nof_results"));
	var nof_results_int = parseInt(nof_results_string);

	if (nof_results_int > 32)//L1TD_IPC_EUTRAN_MAX_NOF_CELLS_PER_EARFCN=32
		return "--";

	for(var i=0; i<nof_results_int; i++)
	{
		var IRAT_cell_ID_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".cell_ID"));
		result += " (Cell_ID:" + IRAT_cell_ID_string;

		var IRAT_rsrp_first_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".RSRP"));
		result += " RSRP:" + IRAT_rsrp_first_string;

		var IRAT_rsrq_first_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".RSRQ"));
		result += " RSRQ:" + IRAT_rsrq_first_string + ")";
	}

	return result;
}

/////////////////////////////////////////////////////////////////////// --------------est_req_SMS05025943
function process__L1TDE_UTRAN_IRAT_MEAS_REPORT_IND( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDE_UTRAN_IRAT_MEAS_REPORT_IND.";
	var result = "";

	var IRAT_uarfcn_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"uarfcn"));
	var result = "UARFCN:" + IRAT_uarfcn_string;

	var nof_results_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"nof_results"));
	var nof_results_int = parseInt(nof_results_string);

	if (nof_results_int > 32)	//L1TD_IPC_TDSCDMA_MAX_NOF_CELLS_PER_UARFCN=32
		return "--";

	for(var i=0; i<nof_results_int; i++)
	{
		var IRAT_cell_ID_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".cell_para_id"));
		result += " (Cell_ID:" + IRAT_cell_ID_string;

		var IRAT_rscp_first_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".rscp"));
		result += " RSCP:" + IRAT_rscp_first_string + ")";
	}

	return result;
}

////////////////////////////////////////////////////////////////////////************Have no trace to test and verify
function process__L1TDE_GERAN_IRAT_MEAS_REPORT_IND( msg )
{
	var result = "";
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDE_GERAN_IRAT_MEAS_REPORT_IND.";
	var PayloadName = getPayloadName( msg );
/*
	var nof_results_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"nof_results"));
	var nof_results_int = parseInt(nof_results_string);

	if (nof_results_int > 32)//L1TD_IPC_MAX_NOF_GERAN_NCELL
	    return "--";

	for(var i=0; i<nof_results_int; i++)
	{
		var IRAT_bsic_first_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".bsic"));
		result += "(BSIC:" + IRAT_bsic_first_string;

		var IRAT_arfcn_first_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".arfcn"));
		result += " ARFCN:" + IRAT_arfcn_first_string;

		var IRAT_rxlev_first_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".rxlev"));
		result += " RXLEV:" + IRAT_rxlev_first_string + ") ";
	}
*/
	return result;
}

///////////////////////////////////////////////////////////////////////----------------581
function process__L1TDG_UTRAN_IRAT_MEAS_REPORT_IND( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "P_HLS_L1_IRAT_IND.L1TDG_UTRAN_IRAT_MEAS_REPORT_IND.";
	var result = "";

	var IRAT_uarfcn_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"uarfcn"));
	var result = "UARFCN:" + IRAT_uarfcn_string;

	var nof_results_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"nof_results"));
	var nof_results_int = parseInt(nof_results_string);

	if (nof_results_int > 32)//L1TD_IPC_TDSCDMA_MAX_NOF_CELLS_PER_UARFCN=32
		return "--";

	for(var i=0; i<nof_results_int; i++)
	{
		var IRAT_cell_ID_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".cell_para_id"));
		result += " (Cell_ID:" + IRAT_cell_ID_string;

		var IRAT_rscp_first_string = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_meas : 32[0x0020] items."+i+".rscp"));
		result += " RSCP:" + IRAT_rscp_first_string + ")";
	}

	return result;
}
//add for TDSCDMA  L1-----end



//add for TDSCDMA TRRC-----start
///////////////////////////////////////////////////////////////////////-------------------581
function process__TRRC_ACT_REQ( msg )
{
	var PayloadName = getPayloadName( msg );
	var MsgName = "TRRC_ACT_REQ_param.";
	var result = "";
	var uarfcn = "";
	var mcc = "";
	var mnc = "";

	var service_mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"service_mode")));
	service_mode = service_mode.replace("E_AS_SERVICE_MODE_", "");
	result = "" + service_mode;

	var search_type = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"search_type")));
	search_type = search_type.replace("E_AS_SEARCH_TYPE_", "");
	result += " " + search_type;

	var len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName,  MsgName+"equiv_plmns.length"));
	if (parseInt(len) > 16)//LENGTH_OF_UPLMN_ARRAY=16
		return "--";
	for (var i=0; i<parseInt(len); i++)
	{
		mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"equiv_plmns.plmn : 16[0x0010] items."+i+".mcc"));
		mnc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"equiv_plmns.plmn : 16[0x0010] items."+i+".mnc"));
		mcc = intToHexString(parseInt(mcc), 4);
		mnc = intToHexString(parseInt(mnc), 4);
		result += " (MCC:" + mcc + " MNC:" + mnc + ")";
	}

	var len2 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName,  MsgName+"uarfcn_list.list_len"));
	if (parseInt(len2) > 16)//NAS_UARFCN_LIST_MAX=16
		return "--";
	if (parseInt(len2) != 0)
		result += " UARFCNs:(";
	for (var j=0; j<parseInt(len2); j++)
	{
		uarfcn = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"uarfcn_list.uarfcn["+i+"]"));
		result += "" + uarfcn + " ";
	}
	if (parseInt(len2) != 0)
		result += ")";

	return result;
}

////////////////////////////////////////////////////////////////////////***********"Full decoder" havn't valid info
function process__TRRC_ACT_IND( msg )
{
	var result = "";
/*
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_ACT_IND_param.";
	if (PayloadName == "TRRC_ACT_IND")
		iStream.skipBytes(0);
	if (PayloadName == "Message content")
		return result;//NO CONTENT

	var len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+""));
	if (parseInt(len) > 16)
		return "--";
	for (var i=0; i<parseInt(len); i++)
	{
		result += "(MCC:" + stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+".["+i+"].mcc"))  +
			" MNC:" + stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+".["+i+"].mnc")) + ") ";
	}
*/
	return result;
}

////////////////////////////////////////////////////////////////////////***********"Full decoder" havn't valid info
function process__TRRC_ACT_FAIL( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_ACT_FAIL_param.";
	var result = "";
/*
	var uarfcn = "";

	var service_mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"")));
	service_mode = service_mode.replace("L1TDE_IPC_IRAT_MEAS_MODE_", "");
	var result = "MODE:" + service_mode;

	var len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName + ""));
	if (parseInt(len) > 16)
		return "^-^";
	for (var i=0; i<parseInt(len); i++)
	{
		result += " (MCC:" + stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+".["+i+"].mcc"))  +
			" MNC:" + stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+".["+i+"].mnc")) + ")";
	}
*/
	return result;
}

///////////////////////////////////////////////////////////////////////-------------581  457
function process__TRRC_UPDATE_UPLMN_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_UPDATE_UPLMN_REQ_param.";
	var result = "";
	var lac = "";
	var mcc = "";
	var mnc = "";

	var len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ulai_list.length"));
	if (parseInt(len) > 16)	//LENGTH_OF_ULAI_ARRAY=16
		return "--";
	if (len != "0")
		result += "ForbLAIs:" + len + " ";
	for (var i=0; i<parseInt(len); i++)
	{
		mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ulai_list.lai : 15[0x000f] items."+i+".plmn.mcc"));
		mnc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ulai_list.lai : 15[0x000f] items."+i+".plmn.mnc"));
		mcc = intToHexString(parseInt(mcc), 4);
		mnc = intToHexString(parseInt(mnc), 4);
		result += "(MCC:" + mcc + " MNC:" + mnc + ") ";
	}

	var len2 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"equiv_plmns.length"));
	if (parseInt(len2) > 16)	//LENGTH_OF_UPLMN_ARRAY=16
		return "--";
	if (len2 != "0")
		result += "EqvPLMNs:" + len2 + " ";
	for (var j=0; j<parseInt(len2); j++)
	{
		mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"equiv_plmns.plmn : 16[0x0010] items."+j+".mcc"));
		mnc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"equiv_plmns.plmn : 16[0x0010] items."+j+".mnc"));
		mcc = intToHexString(parseInt(mcc), 4);
		mnc = intToHexString(parseInt(mnc), 2);

		mcc = mcc.substring( 3, 4) + mcc.substring( 2, 3) + mcc.substring( 1, 2) + mcc.substring( 0, 1);
		if (mcc.substring( 3, 4) == "F")
			mcc = mcc.substring( 0, 3);
		mnc = mnc.substring( 1, 2) + mnc.substring( 0, 1);

		result += Build_MccMnc( mcc, mnc )+TYPE_SEP2;
	}

	var service_mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName + "service_mode")));
	service_mode = service_mode.replace("E_AS_SERVICE_MODE_", "");
	result += " " + service_mode;

	return result;
}

///////////////////////////////////////////////////////////////////////---------------------581
function process__TRRC_PLMN_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_PLMN_REQ_param.";
	var result = "";
	var mcc = "";
	var mnc = "";
	var uarfcn = "";

	var search_type = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"search_type")));
	search_type = search_type.replace("E_AS_SEARCH_TYPE_", "");
	result = "" + search_type + " ";

	var len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"mcc_list.list_len"));
	if (parseInt(len) > 16)//AS_MCC_LIST_MAX=16
		return "--";
	if (len != "0")
		result += "SearchNum:" + len + " ";
	for (var i=0; i<parseInt(len); i++)
	{
		mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"mcc_list.mcc_array : 16[0x0010] numbers.[000"+i+"]"));
		mcc = intToHexString(parseInt(mcc), 4);
		result += "(MCC:" + mcc + ") ";
	}

	var len2 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"plmn_list.length"));
	if (parseInt(len2) > 16)//LENGTH_OF_UPLMN_ARRAY=16
		return "--";
	if (len2 != "0")
		result += "PLMNs:" + len2 + " ";
	for (var j=0; j<parseInt(len2); j++)
	{
		mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"plmn_list.plmn : 16[0x0010] items."+j+".mcc"));
		mnc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"plmn_list.plmn : 16[0x0010] items."+j+".mnc"));
		mcc = intToHexString(parseInt(mcc), 4);
		mnc = intToHexString(parseInt(mnc), 4);
		result += "(MCC:" + mcc + " MNC:" + mnc + ") ";
	}

	var len3 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"uarfcn_list.list_len"));
	if (parseInt(len3) > 16)
		return "--";
	if (len3 != "0")
		result += "UARFCNs:" + len3 + " ";
	for (var k=0; k<parseInt(len3); k++)
	{
		uarfcn = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"uarfcn_list.uarfcn : 32[0x0020] numbers.[000"+k+"]"));
		result += "" + uarfcn + " ";
	}

	return result;
}

///////////////////////////////////////////////////////////////////////----------------------581
function process__TRRC_CELL_PARAMETER_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_CELL_PARAMETER_REQ_param.netpar.";
	var result = "";

	var gsm_present = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_present"));
	var fdd_present = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fdd_present"));
	var tdd_present = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tdd_present"));

	//GSM
	var scell_arfcn = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_netpar.scell_arfcn"));
	if (gsm_present == "1")
		result += "GSM: SCELL_ARFCN:" + scell_arfcn + " ";
	var nbr_ncells = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_netpar.nbr_ncells"));
	if (gsm_present == "1")
		result += "NBR_ncells:" + nbr_ncells + " ";

	//FDD
	var intra_freq = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fdd_netpar.intra_freq"));
	if (fdd_present == "1")
		result += "FDD: INTRA_FREQ:" + intra_freq + " ";
	var nbr_intra_freq_sc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fdd_netpar.nbr_intra_freq_sc"));
	if (fdd_present == "1")
		result += "NBR_INTRA_FREQ_SC:" + nbr_intra_freq_sc + " ";

	//TDD
	var intra_freq = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tdd_netpar.intra_freq"));
	if (tdd_present == "1")
		result += "TDD: INTRA_FREQ:" + intra_freq + " ";
	var nbr_intra_freq_sc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tdd_netpar.nbr_intra_freq_sc"));
	if (tdd_present == "1")
		result += "NBR_INTRA_FREQ_SC:" + nbr_intra_freq_sc + " ";

	return result;
}

////////////////////////////////////////////////////////////////////////********************71  NO CONTENT   457
function process__TRRC_CELL_PARAMETER_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_CELL_PARAMETER_IND_param.netpar.";
	var result = "";

	var gsm_present = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_present"));
	var fdd_present = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fdd_present"));
	var tdd_present = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tdd_present"));

	//GSM
	var scell_arfcn = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_netpar.scell_arfcn"));
	if (gsm_present == "1")
		result += "GSM: SCELL_ARFCN:" + scell_arfcn + " ";
	var nbr_ncells = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_netpar.nbr_ncells"));
	if (gsm_present == "1")
		result += "NBR_ncells:" + nbr_ncells + " ";

	//FDD
	var intra_freq = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fdd_netpar.intra_freq"));
	if (fdd_present == "1")
		result += "FDD: INTRA_FREQ:" + intra_freq + " ";
	var nbr_intra_freq_sc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fdd_netpar.nbr_intra_freq_sc"));
	if (fdd_present == "1")
		result += "NBR_INTRA_FREQ_SC:" + nbr_intra_freq_sc + " ";

	//TDD
	var intra_freq = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tdd_netpar.intra_freq"));
	if (tdd_present == "1")
		result += "TDD: INTRA_FREQ:" + intra_freq + " ";
	var nbr_intra_freq_sc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tdd_netpar.nbr_intra_freq_sc"));
	if (tdd_present == "1")
		result += "NBR_INTRA_FREQ_SC:" + nbr_intra_freq_sc + " ";

	return result;
}

///////////////////////////////////////////////////////////////////////----------581
function process__TRRC_SIM_INFO_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_SIM_INFO_REQ_param.";
	var result = "";

	var identity_len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"imsi.identity_len"));
	if (parseInt(identity_len) > 8)
		return "--";
	if (parseInt(identity_len) == 0)
		return result;

	result = "IMSI" + EQUALS + "0x";
	for(var i=0; i<parseInt(identity_len); i++)
	{
		var val1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"imsi.identity.A :  8[0x0008] numbers.[000"+i+"]"));
		result += intToHexString(val1, 2);
	}

	return result;
}

///////////////////////////////////////////////////////////////////////-------------------581  457
function process__TRRC_UPDATE_PARAM_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_UPDATE_PARAM_REQ_param.";
	var result = "";

	var TmsiIncluded = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tmsi_lai_included"));
	if (TmsiIncluded == "1")
	{
		var len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tmsi.identity_len"));
		if(parseInt(len) == 0)
			return result;

		var val1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tmsi.tmsi.A :  4[0x0004] numbers.[0000]"));
		var val2 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tmsi.tmsi.A :  4[0x0004] numbers.[0001]"));
		var val3 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tmsi.tmsi.A :  4[0x0004] numbers.[0002]"));
		var val4 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"tmsi.tmsi.A :  4[0x0004] numbers.[0003]"));
		var val1 = intToHexString(parseInt(val1), 1);
		var val2 = intToHexString(parseInt(val2), 1);
		var val3 = intToHexString(parseInt(val3), 1);
		var val4 = intToHexString(parseInt(val4), 1);
		result = "TMSI:0x" + val1 + "" + val2 + "" + val3 + "" + val4 + " ";

		var mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ulai.plmn.mcc"));
		var mnc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ulai.plmn.mnc"));
		var lac = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ulai.lac"));
		mcc = intToHexString(parseInt(mcc), 4);
		mnc = intToHexString(parseInt(mnc), 4);
		lac = intToHexString(parseInt(lac), 4);
		result += "MCC:" + mcc + " MNC:" + mnc  + " LAC:" + lac;
	}

	return result;
}

///////////////////////////////////////////////////////////////////////-------------581  457
function process__TRRC_GMM_UPDATE_PARAM_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_GMM_UPDATE_PARAM_REQ_param.";
	var result = "";

	var PtmsiIncluded = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"p_tmsi_rai_included"));
	if (PtmsiIncluded == "1")
	{
		var len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"p_tmsi.identity_len"));
		if(parseInt(len) == 0)
			return result;

		var val1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"p_tmsi.tmsi.A :  4[0x0004] numbers.[0000]"));
		var val2 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"p_tmsi.tmsi.A :  4[0x0004] numbers.[0001]"));
		var val3 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"p_tmsi.tmsi.A :  4[0x0004] numbers.[0002]"));
		var val4 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"p_tmsi.tmsi.A :  4[0x0004] numbers.[0003]"));
		var val1 = intToHexString(parseInt(val1), 1);
		var val2 = intToHexString(parseInt(val2), 1);
		var val3 = intToHexString(parseInt(val3), 1);
		var val4 = intToHexString(parseInt(val4), 1);
		result = "TMSI:0x" + val1 + "" + val2 + "" + val3 + "" + val4 + " ";

		var mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"urai.lai.plmn.mcc"));
		var mnc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"urai.lai.plmn.mnc"));
		var lac = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"urai.lai.lac"));
		mcc = intToHexString(parseInt(mcc), 4);
		mnc = intToHexString(parseInt(mnc), 4);
		lac = intToHexString(parseInt(lac), 4);
		result += "MCC:" + mcc + " MNC:" + mnc  + " LAC:" + lac;
	}

	return result;
}

///////////////////////////////////////////////////////////////////////-----------------------581  457
function process__TRRC_SECURITY_RES( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_SECURITY_RES_para.";

	var key_valid = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"key_valid")));
	return key_valid;
}

///////////////////////////////////////////////////////////////////////-----------------------581  457
function process__TRRC_GMM_SECURITY_RES( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_GMM_SECURITY_RES_para.";

	var key_valid = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"key_valid")));
	return key_valid;
}

///////////////////////////////////////////////////////////////////////---------------------581
function process__TRRC_GMM_ESTABLISH_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_GMM_ESTABLISH_REQ_para.";

	var est_cause = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"est_cause")));
	return est_cause;
}

///////////////////////////////////////////////////////////////////////---------------------581
function process__TRRC_FD_CONFIG_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_FD_CONFIG_REQ_param.";
	var result = "";

	var afd_status = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Param1.afd_status"));
	var fd_delay_timer = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Param1.fd_delay_timer"));
	var scri_timer = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Param1.scri_timer"));
	var enable_fd_if_t323_absent = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Param1.enable_fd_if_t323_absent"));
	var disable_fd_in_pch = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Param1.disable_fd_in_pch"));
	var disable_fd_in_fach = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Param1.disable_fd_in_fach"));

	if (disable_fd_in_pch != 0 )
		result = "IN_PCH";
	if (disable_fd_in_fach != 0 )
		result = "IN_FACH";
	result += "  AFD_STATUS:" + afd_status;

	return result;
}

///////////////////////////////////////////////////////////////////////********************581	"Full decoder" havn't valid info
function process__TRRC_RXSTAT_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var result = "";
/*
	if (PayloadName == "Message content")
		return result;//NO CONTENT

	var pccpch_rscp      = service.getDecodedStructValue(PanelPS, msg, PayloadName, "Param1");
	var rssi      	     = service.getDecodedStructValue(PanelPS, msg, PayloadName, "Param1.rssi");
	var pccpch_rscp_dbm  = service.getDecodedStructValue(PanelPS, msg, PayloadName, "Param1.p_ccpch_rscp_dbm");
	var rssi_dbm         = service.getDecodedStructValue(PanelPS, msg, PayloadName, "Param1.rssi_dbm");

	result = "PCCPCH_RSCP:" + pccpch_rscp + " RSSI:" + rssi;
	result += " PCCPCH_RSCP_dbm:-" + pccpch_rscp_dbm + " RSSI_dbm:-" + rssi_dbm;
*/
	return result;
}

///////////////////////////////////////////////////////////////////////----------------581
function process__TRRC_SET_INACTIVE_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_SET_INACTIVE_REQ_param.";

	var cause = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cause")));
	cause = cause.replace("E_AS_INACTIVE_CAUSE_", "");

	return cause;
}

///////////////////////////////////////////////////////////////////////-----------------581
function process__TRRC_RESEL_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_RESEL_REQ_param.trrc_resel_req_data.";
	var result = "";

	if(PayloadName != "Message content")
		return;
	var msg_id = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"msg_id")));
	msg_id = msg_id.replace("T_MSGTYPE_TRRC_RESEL_REQ_", "");
	if (msg_id == "FROM_RR")	//T_MSGTYPE_TRRC_RESEL_REQ_FROM_RR
	{
		result = "FROM_RR:";
		var Present0 = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"trrc_resel_req_from_rr.transition_info_present")));
		/*if (Present0 == rr_trrc_redirection_info) //rr_trrc_redirection_info
		{
		    result += " REDIREC:";
	        var tdd_length0 = iStream.readUnsignedByte();
			iStream.skipBytes(3);
			for (var i0=0; i0<parseInt(tdd_length0); i0++)
	        {
	            var cell_length0 = iStream.readUnsignedByte();
				iStream.skipBytes(3);
				for (var j0=0; j0<parseInt(cell_length0); j0++)
	            {
				    var uarfcn0 = swapbyte_return_word(iStream.readUnsignedByte(),iStream.readUnsignedByte());
					iStream.skipBytes(2);
					var cell_id0 = swapbyte_return_long(iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte());
	                iStream.skipBytes(6);
					result += "(uarfcn" + uarfcn0 + ",cell_id" + cell_id0 + ")";
				}
				iStream.skipBytes(32*(4+12) - parseInt(cell_length0)*(4+12));
	        }
		}*/
		if (Present0 == "rr_trrc_reselection_info")//rr_trrc_reselection_info
		{
			result += " RESELEC:";
			var num_of_cells1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"trrc_resel_req_from_rr.rr_trrc_reselection_info.num_of_cells"));
			if (parseInt(num_of_cells1) > 6)//MAX_RESEL_TDD_CELLS=6
				return "--";

			for (var i1=0; i1<parseInt(num_of_cells1); i1++)
			{
				var tdd_uarfcn1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"trrc_resel_req_from_rr.rr_trrc_reselection_info.A :  6[0x0006] items."+i1+".tdd_uarfcn"));
				var cell_id1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"trrc_resel_req_from_rr.rr_trrc_reselection_info.A :  6[0x0006] items."+i1+".cell_id"));
				var rscp1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"trrc_resel_req_from_rr.rr_trrc_reselection_info.A :  6[0x0006] items."+i1+".rscp"));
				result += " (UARFCN:" + tdd_uarfcn1 + " CELL:" + cell_id1 + " RSCP:" + rscp1 + ")";
			}
		}
		/*if (Present0 == "2") //rr_trrc_pfr_info
		{
		    result += " PFR:";
	        var tdd_length2 = iStream.readUnsignedByte();
			iStream.skipBytes(3);
			for(var i2=0; i2<parseInt(tdd_length2); i2++)
	        {
	            var cell_length2 = iStream.readUnsignedByte();
				iStream.skipBytes(3);
				for (var j2=0; j2<parseInt(cell_length2); j2++)
	            {
				    var arfcn2 = swapbyte_return_word(iStream.readUnsignedByte(),iStream.readUnsignedByte());
					iStream.skipBytes(2);
					var cell_id2 = swapbyte_return_long(iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte());
	                iStream.skipBytes(6);
					result += "(arfcn" + arfcn2 + ",cell_id" + cell_id2 + ")";
				}
				iStream.skipBytes(32*(4+12) - parseInt(cell_length2)*(4+12));
	        }
		}*/
	}

	/*if (msg_id == FROM_ERRC) //T_MSGTYPE_TRRC_RESEL_REQ_FROM_ERRC
	{
	    result = "FROM_ERRC:";
	    var Present1 = iStream.readUnsignedByte();
		if (Present1 == "0") //trrc_redirection_info
		{
		    result += " REDIREC:";
	               var cell_length3 = iStream.readUnsignedByte();
			iStream.skipBytes(3);
			for(var j3=0; j3<parseInt(cell_length3); j3++)
	                {
			       var uarfcn3 = swapbyte_return_word(iStream.readUnsignedByte(),iStream.readUnsignedByte());
				iStream.skipBytes(2);
				var cell_id3 = swapbyte_return_long(iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte());
	                         iStream.skipBytes(6);
				result += "(uarfcn" + uarfcn3 + ",cell_id" + cell_id3 + ")";
			}
			iStream.skipBytes(32*(4+12) - parseInt(cell_length3)*(4+12));
		}
		if (Present1 == "1")//trrc_reselection_info
		{
		    result += " RESELEC:";
	        var num_of_cells4 = iStream.readUnsignedByte();
			iStream.skipBytes(3);
			/*for (var i1=0; i1<parseInt(num_of_cells4); i1++)
	        {
			    var tdd_uarfcn4 = swapbyte_return_word(iStream.readUnsignedByte(),iStream.readUnsignedByte());
				iStream.skipBytes(2);
				var cell_id4 = swapbyte_return_long(iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte());
				var rscp4 = iStream.readUnsignedByte();
				result += "(uarfcn" + tdd_uarfcn4 + ",cell_id" + cell_id4 + ",rscp" + rscp4 + ")";
	        }
		}
	}*/

	return result;
}

///////////////////////////////////////////////////////////////////////********************581"Full decoder" havn't valid info
function process__TRRC_RESEL_REJ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_RESEL_REQ_param.trrc_resel_req_data.";
	var result = "";
/*
	if (PayloadName == "Message content")
		return result;//no content

	var msg_id = swapbyte_return_long(iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte());
	if (msg_id == "0")	//T_MSGTYPE_TRRC_RESEL_REJ_TO_RR
	{
		result = "TO_RR:";

		var length1 = iStream.readUnsignedByte();
		if (parseInt(length1) > 6)
			return "--";

		iStream.skipBytes(3);
		for (var i=0; i<parseInt(length1); i++)
		{
		   var reselfail_cause1 = iStream.readUnsignedByte();
		   var reselfail_cause1_short = convert_ReselRej_to_str(reselfail_cause1);
		   result += " " + reselfail_cause1_short;
		   iStream.skipBytes(3);
		   iStream.skipBytes(4);
		}
		iStream.skipBytes(6*8 - parseInt(length1)*8);
	}

	if (msg_id == "1")//T_MSGTYPE_TRRC_RESEL_REJ_TO_ERRC
	{
		result += "TO_ERRC:";

		var length2 = iStream.readUnsignedByte();
		if (parseInt(length2) > 32)//MAX_FAILURE_REPORTS=32
			return "--";

		iStream.skipBytes(3);
		for (var j=0; j<parseInt(length2); j++)
		{
		   var reselfail_cause2 = iStream.readUnsignedByte();
		   var reselfail_cause2_short = convert_ReselRej_to_str(reselfail_cause2);
		   result += " " + reselfail_cause2_short;
		   iStream.skipBytes(3);
		   iStream.skipBytes(4);
		}
	}
*/
	return result;
}

///////////////////////////////////////////////////////////////////////********************581"Full decoder" havn't valid info
function process__TRRC_RESEL_CNF( msg )
{
	var bContent = getContentSafely(msg);
	var biStream = new ByteArrayInputStream(bContent);
	var iStream = new DataInputStream(biStream);
	var result = "";
/*
	var PayloadName = getPayloadName(msg);
	if ((PayloadName == "TRRC_RESEL_REJ")||(PayloadName == "TRRC_RESEL_CNF"))
		iStream.skipBytes(0);
	if (PayloadName == "Message content")
		return result;//no content

	var msg_id = swapbyte_return_long(iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte(),iStream.readUnsignedByte());
	if (msg_id == "0")//T_MSGTYPE_TRRC_RESEL_REJ_TO_RR
	{
		result = "TO_RR:";

		var length1 = iStream.readUnsignedByte();
		if (parseInt(length1) > 6)
			return "--";

		iStream.skipBytes(3);
		for (var i=0; i<parseInt(length1); i++)
		{
		   var reselfail_cause1 = iStream.readUnsignedByte();
		   var reselfail_cause1_short = convert_ReselRej_to_str(reselfail_cause1);
		   result += " " + reselfail_cause1_short;
		   iStream.skipBytes(3);
		   iStream.skipBytes(4);
		}
		iStream.skipBytes(6*8 - parseInt(length1)*8);
	}

	if (msg_id == "1")//T_MSGTYPE_TRRC_RESEL_REJ_TO_ERRC
	{
		result += "TO_ERRC:";

		var length2 = iStream.readUnsignedByte();
		if (parseInt(length2) > 32)//MAX_FAILURE_REPORTS=32
			return "--";

		iStream.skipBytes(3);
		for (var j=0; j<parseInt(length2); j++)
		{
		   var reselfail_cause2 = iStream.readUnsignedByte();
		   var reselfail_cause2_short = convert_ReselRej_to_str(reselfail_cause2);
		   result += " " + reselfail_cause2_short;
		   iStream.skipBytes(3);
		   iStream.skipBytes(4);
		}
	}
*/
	return result;
}

///////////////////////////////////////////////////////////////////////-----------457
function process__TRRC_GMM_RELEASE_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_GMM_RELEASE_REQ_para.";
	var result = "";

	var abort_cause = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"abort_cause")));
	result = "CAUSE:" + abort_cause;
	return result;
}

///////////////////////////////////////////////////////////////////////-----------221
function process__TRRC_ENABLED_RATS_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_ENABLED_RATS_REQ_param.";
	var result = "";

	var geran_enabled = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"geran_enabled")));
	var utran_enabled = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"utran_enabled")));
	var eutran_enabled = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"eutran_enabled")));
	result = "geran:" + geran_enabled + " utran:" + utran_enabled + " eutran:" + eutran_enabled;
	return result;
}

///////////////////////////////////////////////////////////////////////------------------457
function process__TRRC_EST_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "TRRC_EST_REQ_para.";
	var result = "";

	var cause = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"est_cause")));
	result = "Cause:" + cause;

	var mcc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"plmn.mcc"));
	var mnc = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"plmn.mnc"));
	var call_type = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"call_type")));
	mcc = intToHexString(parseInt(mcc), 4);
	mnc = intToHexString(parseInt(mnc), 4);
	result += " MCC:" + mcc + " MNC:" + mnc  + " CallType:" + call_type;

	return result;
}

////////////////////////////////////////////////////////////////////////**********have no trace to test and verify
function process__TRRC_ABORT_REQ( msg )
{
	var bContent = getContentSafely(msg);
	var biStream = new ByteArrayInputStream(bContent);
	var iStream = new DataInputStream(biStream);
	var result = "";

	var PayloadName = getPayloadName(msg);
	if (PayloadName == "TRRC_ABORT_REQ")
		iStream.skipBytes(0);
	if (PayloadName == "Message content")
		iStream.skipBytes(19);

	var cause = iStream.readUnsignedByte();
	if (cause == "1")
		result = "authentication check failure";
	else
		result = "other cases";

	return result;
}

///////////////////////////////////////////////////////////////////////----------------581
function process__P_DIAG_EXT_PRINT_IND( msg )
{
	var bContent = getContentSafely(msg);
	var biStream = new ByteArrayInputStream(bContent);
	var iStream = new DataInputStream(biStream);
	var result = "";

	var PayloadName = getPayloadName(msg);
	if (PayloadName == "Message content")
		iStream.skipBytes(19);

	var length = iStream.readUnsignedByte();
	for (var i=0; i<parseInt(length); i++)
	{
		var val = iStream.readUnsignedByte();
		if(parseInt(val)!=10)
		{
			result += String.fromCharCode(parseInt(val));
		}
	}

	return result;
}

///////////////////////////////////////////////////////////////////////-----------457
function process__P_HLS_L1_RL_SETUP_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_RRC_PHY_RL_Setup_REQ_param_dcfe.";
	var result = "";

	var W_FREQ = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"w_freq"));
	//W_FREQ = intToHexString(parseInt(W_FREQ), 4);
	result = "W_FREQ:" + W_FREQ;

	var FREQ_INFO = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"frequency_info"));
	//FREQ_INFO = intToHexString(parseInt(FREQ_INFO), 4);
	result += " FREQ_INFO:" + FREQ_INFO;

	var CELL_PARAM_ID = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_parameter_id"));
	//CELL_PARAM_ID = intToHexString(parseInt(CELL_PARAM_ID), 4);
	result += " CELL_PARAM_ID:" + CELL_PARAM_ID;

	return result;
}

///////////////////////////////////////////////////////////////////////-----------457
function process__P_HLS_L1_RL_MODIFY_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_RRC_PHY_RL_Modify_REQ_param.";
	var result = "";

	var W_FREQ = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"w_freq"));
	//W_FREQ = intToHexString(parseInt(W_FREQ), 4);
	result = "W_FREQ:" + W_FREQ;

	var FREQ_INFO = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"frequency_info"));
	//FREQ_INFO = intToHexString(parseInt(FREQ_INFO), 4);
	result += " FREQ_INFO:" + FREQ_INFO;

	var CELL_PARAM_ID = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_parameter_id"));
	//CELL_PARAM_ID = intToHexString(parseInt(CELL_PARAM_ID), 4);
	result += " CELL_PARAM_ID:" + CELL_PARAM_ID;

	return result;
}

///////////////////////////////////////////////////////////////////////-----------457
function process__P_HLS_L1_STATECHG_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_RRC_PHY_STATECHG_IND_param.";
	var result = "";

	var RRC_STATUS = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"state")));
	result = "RRC_STATUS:" + RRC_STATUS;

	return result;
}


///////////////////////////////////////////////////////////////////////-----------221
function process__P_DIAG_EXT_ACCESS_CNF( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_DIAG_EXT_ACCESS_CNF_param.";
	var result = "";

	var error_cause = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"error_cause")));
	var Phyfa_L1 = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Phyfa_L1")));
	var ex = "[\\(\\[]";
	var regex = new RegExp(ex, 'g');
	Phyfa_L1 = Phyfa_L1.split( regex )[0];
	Phyfa_L1 = stripQuotes(stripLiteralText(Phyfa_L1));
	result = "error_cause:" + error_cause + " Phyfa_L1:" + Phyfa_L1;
	return result;
}

///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_L1_HLS_INIT_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_L1_HLS_INIT_IND_param.";
	var result = "";

	var mode = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"mode")));
	var init_type = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"init_type")));
	init_type = init_type.replace("HLS_L1_WORK_MODE_", "");
	result = "mode:" + mode + " init_type:" + init_type;
	return result;
}

///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_HLS_L1_UEINFO_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_RRC_PHY_UEINFO_REQ_param.";
	var result = "";

	var txpowercapability = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"txpowercapability")));
	result = "txpowercap:" + txpowercapability;

	var imsi_len = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"imsi_len"));
	if (parseInt(imsi_len) > 15)
		return "--";
	result += " IMSI" + EQUALS + "0x";
	for(var i=0; i<8; i++)
	{
		var val1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"imsi :  8[0x0008] numbers.[000"+i+"]"));
		result += intToHexString(val1, 2);
	}

	var HSDPA_CATEGORY = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"HSDPA_CATEGORY")));
	var edch_category = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"edch_category")));
	result += " HSDPA_CATEGORY:" + HSDPA_CATEGORY + " EDCH_CATEGORY:" + edch_category;

	return result;
}


///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_HLS_L1_SERVICE_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_HLS_L1_SERVICE_IND_prarm.";
	var result = "";

	var ongo_status = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ongo_status")));
	result = "ongoing status: "+ongo_status;

	//var frequency = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.frequency_info")));
	//var cell_id = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.cell_parameter_id")));
	//var rscp = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.rscp")));
	//result += "Cell:" + frequency + "|" + cell_id + " rscp:" + rscp;

	return result;
}


///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_HLS_L1_CELLSEARCH_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_RRC_PHY_CellSearch_REQ_param.";
	var result = "";

	var cell_num = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cellnum")));
	var int_cell_num = parseInt(cell_num);

    if (int_cell_num >0)
    {
      result += "Search Cells("+cell_num+")"+EQUALS;
	  var freq;
	  var cs;
	  var cell_num_Hex;
      for (var i=0; i<int_cell_num; i++)
      {
        if (int_cell_num < 10)
        {
			freq = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cellinfostinfo :  "+cell_num+"[0x000"+cell_num+"] items."+i+".frequency_info")));
			cs   = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cellinfostinfo :  "+cell_num+"[0x000"+cell_num+"] items."+i+".cell_parameter_id")));
        }
		else
		{
			cell_num_Hex = Number(cell_num).toString(16);
			freq = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cellinfostinfo : "+cell_num+"[0x00"+cell_num_Hex+"] items."+i+".frequency_info")));
			cs   = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cellinfostinfo : "+cell_num+"[0x00"+cell_num_Hex+"] items."+i+".cell_parameter_id")));
		}
		result  += freq+"|"+cs+TYPE_SEP;
      }
    }
	else
	{
	  var radio_bands = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"radio_bands")));
	  result = "Band: " + radio_bands;

	  var band_ind = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"band_ind")));
	  result += " (" + band_ind + ")";
	}

	return result;
}

///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_L1_HLS_CELLSEARCH_CNF( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_PHY_RRC_CellSearch_CNF_param.";
	var result = "";

	var fail_ind = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fail_ind")));
	result = fail_ind+TYPE_SEP;

	var frequency = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.frequency_info")));
	var cell_id = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.cell_parameter_id")));
	var rscp = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.rscp")));
	result += "Cell:" + frequency + "|" + cell_id + " rscp:" + rscp;

	return result;
}


///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_L1_HLS_SEARCHNEXT_CNF( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_PHY_RRC_SearchNext_CNF_param.";
	var result = "";

	var fail_ind = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fail_ind")));
	result = fail_ind+TYPE_SEP;

	var frequency = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.frequency_info")));
	var cell_id = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.cell_parameter_id")));
	var rscp = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"cell_report_info_st.rscp")));
	result += "Cell:" + frequency + "|" + cell_id + " rscp:" + rscp;

	return result;
}


///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_HLS_L1_MEASURE_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_RRC_PHY_MeasControl_REQ_param.";
	var result = "";

	var measCommand    = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"meas_command");
	var fieldindicator = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fieldIndicator");

	measCommand        = measCommand.substring(measCommand.length()-3, measCommand.length()-1);
	fieldindicator     = fieldindicator.substring(fieldindicator.length()-3, fieldindicator.length()-1);

	if(ParseInt(measCommand) == 0x00)//PHY_MEAS_CONFIG
	{
		result += "Meas Configure"+EQUALS;
		if (ParseInt(fieldindicator) & 0x01)
		{
			result +="Serv Cell"+TYPE_SEP2;
		}
		if (ParseInt(fieldindicator) & 0x02)
		{
			result +="TDS Cells"+TYPE_SEP2;
		}
		if (ParseInt(fieldindicator) & 0x04)
		{
			result +="GSM Cells"+TYPE_SEP2;
		}
		if (ParseInt(fieldindicator) & 0x08)
		{
			result +="LTE Cells"+TYPE_SEP2;
		}
	}

	return result;
}


///////////////////////////////////////////////////////////////////////
function getBracketVal(valStr)
{
	return parseInt(valStr.match(/\[(.*)\]/)[1]);
}

///////////////////////////////////////////////////////////////////////-----------A18_CS_Register_Fail_2
function process__P_L1_HLS_MEASURE_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_PHY_RRC_MeasReport_IND_param.";
	var result = "";

	var fieldindicator = getBracketVal(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fieldIndicator"));
	/*
	*Bit0: serving cell measurement results indicator
	*Bit1: TDD neighbor cell measurement results indicator
	*Bit2: GSM neighbor cell measurement results indicator
	*Bit3: eutra neighbor cell measurement indicator.
	*/

	if (fieldindicator & 0x01)//Serving cell
	{
		var pccpch_rscp = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"scell_meas_result_st_info.pccpch_rscp")));
		result += "Serv RSCP"+EQUALS+pccpch_rscp+"dBm"+TYPE_SEP2;
	}

	if (fieldindicator & 0xfe)//Ncells
	{
		result += "    Best NCell"+EQUALS;

		if (fieldindicator & 0x02) // TDD Neighbor cells
		{
			var cell_count = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Neighbor_cell_num");
			var cell_count_Dec,cell_count_Hex;
			cell_count_Dec = parseInt(cell_count.substring(0, 2));
			cell_count_Hex = cell_count.substring(cell_count.length()-3, cell_count.length()-1);

			var s_freq, s_cellParamId,s_rscp, c_freq, c_cellParamId, c_rscp, indicator, space;
			s_rscp="-255";
			if (cell_count_Dec>9)
				space = " ";
			else
				space = "  ";

			for (var i=0; i<cell_count_Dec; i++)
			{
				c_freq        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".freq_info"));
				c_cellParamId = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".cell_param_id"));
				c_rscp        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".pccpch_rscp"));

				if (parseInt(c_rscp)>parseInt(s_rscp))
				{
					s_freq        = c_freq;
					s_cellParamId = c_cellParamId;
					s_rscp        = c_rscp;
				}
			}
			result += " TDS"+VALUE_SEP+s_freq+"|"+s_cellParamId+"("+s_rscp+"dBm)"+TYPE_SEP2;
		}
		if (fieldindicator & 0x04) // GSM Neighbor cells
		{
			var cell_count = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_ncell_num");
			var cell_count_Dec,cell_count_Hex;
			cell_count_Dec = parseInt(cell_count.substring(0, 2));
			cell_count_Hex = cell_count.substring(cell_count.length()-3, cell_count.length()-1);

			var s_freq, s_cellParamId,s_rssi, c_freq, c_cellParamId, c_rssi, indicator, space, s_bsic_ver,c_bsic_ver;
			s_rssi="-255";
			if (cell_count_Dec>9)
				space = " ";
			else
				space = "  ";


			for (var i=0; i<cell_count_Dec; i++)
			{
				c_freq        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".BCCH_ARFCN"));
				c_cellParamId = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".BSIC"));
				c_rssi        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".GSM_Carrier_RSSI"));
				c_bsic_ver    = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".BSIC_verified"));
				if (parseInt(c_rssi)>parseInt(s_rssi))
				{
					s_freq        = c_freq;
					s_cellParamId = c_cellParamId;
					s_rssi        = c_rssi;
					s_bsic_ver    = c_bsic_ver;
				}
			}
			s_rssi = parseInt(s_rssi)-RSSI_OFFSET;
			result += " GSM"+VALUE_SEP+s_freq+"|"+s_cellParamId+"("+s_rssi+"dBm)(BSIC "+s_bsic_ver+")"+TYPE_SEP2;
		}

		if (fieldindicator & 0x08) // LTE Neighbor cells
		{
			var measuredFreqs = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"eutra_fre_num");
			var measuredFreqsHex =  measuredFreqs.slice(-3, -1);
			measuredFreqs = getBracketVal(measuredFreqs);
			var earfcn, cellId, rsrp, rsrq, bestEarfcn=0, bestCellId=0, bestRsrp=-140, bestRsrq=0;
			var cellFound = false;
			for (var i=0; i<measuredFreqs; i++)
			{
				var foundCells = service.getDecodedStructValue(PanelPS, msg, PayloadName,
					MsgName+"eutra_fre_meas_result_st_info :  "+measuredFreqs+"[0x00"+measuredFreqsHex+"] items."+i+".eutra_cell_per_freq_num");
				foundCells = getBracketVal(foundCells);

				earfcn = service.getDecodedStructValue(PanelPS, msg, PayloadName,
					MsgName+"eutra_fre_meas_result_st_info :  "+measuredFreqs+"[0x00"+measuredFreqsHex+"] items."+i+".carrier_freq");
				earfcn = getBracketVal(earfcn);

				if (foundCells > 0)
				{
					cellFound = true;
					cellId = service.getDecodedStructValue(PanelPS, msg, PayloadName,
						MsgName+"eutra_fre_meas_result_st_info :  "+measuredFreqs+"[0x00"+measuredFreqsHex+"] items."+i+
						".eutra_cell_meas_result_st_info :  1[0x0001] items.0.physical_cell_identity");
					cellId = getBracketVal(cellId);
					rsrp = service.getDecodedStructValue(PanelPS, msg, PayloadName,
						MsgName+"eutra_fre_meas_result_st_info :  "+measuredFreqs+"[0x00"+measuredFreqsHex+"] items."+i+
						".eutra_cell_meas_result_st_info :  1[0x0001] items.0.RSRP");
					rsrp = parseInt(rsrp) - 141;
					rsrq = service.getDecodedStructValue(PanelPS, msg, PayloadName,
						MsgName+"eutra_fre_meas_result_st_info :  "+measuredFreqs+"[0x00"+measuredFreqsHex+"] items."+i+
						".eutra_cell_meas_result_st_info :  1[0x0001] items.0.RSRQ");
					rsrq = parseInt(rsrq) - 29;
					if (rsrp >= bestRsrp) {
						bestEarfcn = earfcn;
						bestRsrp = rsrp;
						bestRsrq = rsrq;
						bestCellId = cellId;
					}
				}

			}
			if (cellFound)
				result += " LTE: earfcn=" + bestEarfcn + ", cellId=" + bestCellId + ", RSRP=" + bestRsrp + "; RSRQ=" + bestRsrq;
			else
				result += "LTE cell "+earfcn+ " not be detected";
		}

	}

	return result;
}

///////////////////////////////////////////////////////////////////////
function process__P_L1_HLS_MEASEVA_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_PHY_RRC_MEASEVA_IND_param.";
	var result = "";

    var fieldindicator = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"fieldIndicator");
	fieldindicator = fieldindicator.substring(fieldindicator.length()-3, fieldindicator.length()-1);

    /*
    *Bit0: serving cell measurement results indicator
     *Bit1: TDD neighbor cell measurement results indicator
     *Bit2: GSM neighbor cell measurement results indicator
     *Bit3: eutra neighbor cell measurement indicator.
      */

	if (parseInt(fieldindicator)&0x01) //Serving cell
	{
		var pccpch_rscp = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"scell_meas_result_st_info.pccpch_rscp")));
		result += "Serv_RSCP:"+EQUALS+pccpch_rscp+" dBm:"+TYPE_SEP2;
	}

	if (parseInt(fieldindicator)&0xfe) //Ncells
	{
		result += " Best_NCell"+EQUALS;

		if (parseInt(fieldindicator)&0x02)
		{
			var cell_count = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"Neighbor_cell_num");
			var cell_count_Dec,cell_count_Hex;
			cell_count_Dec = parseInt(cell_count.substring(0, 2));
			cell_count_Hex = cell_count.substring(cell_count.length()-3, cell_count.length()-1);
			cell_count = parseInt(cell_count.substring(cell_count.length()-3, cell_count.length()-2))*16+parseInt(cell_count.substring(cell_count.length()-2, cell_count.length()-1));

			var s_freq, s_cellParamId,s_rscp, c_freq, c_cellParamId, c_rscp, indicator, space;
			s_rscp="-255";
			if (cell_count>9)
				space = " ";
			else
				space = "  ";

			for (var i=0; i<cell_count; i++)
			{
				c_freq        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".freq_info"));
				c_cellParamId = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".cell_param_id"));
				c_rscp        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".pccpch_rscp"));

				if (parseInt(c_rscp)>parseInt(s_rscp))
				{
					s_freq        = c_freq;
					s_cellParamId = c_cellParamId;
					s_rscp        = c_rscp;
				}
			}
			result += " TDS"+VALUE_SEP+s_freq+"|"+s_cellParamId+"("+s_rscp+"dBm)"+TYPE_SEP2;
		}
		if (parseInt(fieldindicator)&0x04)
		{
			var cell_count = service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_ncell_num");
			var cell_count_Dec,cell_count_Hex;
			cell_count_Dec = parseInt(cell_count.substring(0, 2));
			cell_count_Hex = cell_count.substring(cell_count.length()-3, cell_count.length()-1);
			cell_count = parseInt(cell_count.substring(cell_count.length()-3, cell_count.length()-2))*16+parseInt(cell_count.substring(cell_count.length()-2, cell_count.length()-1));

			var s_freq, s_cellParamId,s_rssi, c_freq, c_cellParamId, c_rssi, indicator, space, s_bsic_ver,c_bsic_ver;
			s_rssi="-255";
			if (cell_count>9)
				space = " ";
			else
				space = "  ";


			for (var i=0; i<cell_count; i++)
			{
				c_freq        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".BCCH_ARFCN"));
				c_cellParamId = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".BSIC"));
				c_rssi        = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".GSM_Carrier_RSSI"));
				c_bsic_ver      = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"gsm_meas_result_st_info :"+space+cell_count_Dec+"[0x00"+cell_count_Hex+"] items."+i+".BSIC_verified"));
				if (parseInt(c_rssi)>parseInt(s_rssi))
				{
					s_freq        = c_freq;
					s_cellParamId = c_cellParamId;
					s_rssi        = c_rssi;
					s_bsic_ver    = c_bsic_ver;
				}
			}
			s_rssi = parseInt(s_rssi)-110;
			result += " GSM"+VALUE_SEP+s_freq+"|"+s_cellParamId+"("+s_rssi+"dBm)(BSIC "+s_bsic_ver+")"+TYPE_SEP2;
		}
	}

	return result;
}


///////////////////////////////////////////////////////////////////////-----------
function process__P_RRC_PHY_SFN_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_RRC_PHY_SFN_IND_param.";
	var result = "";

	var sfn = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"sfn")));
	result = "Sfn:" + sfn;

	var local_frame_number = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"local_frame_number")));
	result += " Lsfn:" + local_frame_number;

	return result;
}


///////////////////////////////////////////////////////////////////////-----------
function process__P_L1_HLS_READBCH_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_PHY_RRC_BCHData_IND_param.";
	var result = "";

	var crc_status = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"crc_valid")));
	result = "CRC_Valid:" + crc_status;

	return result;
}

///////////////////////////////////////////////////////////////////////-----------
function process__P_GCFE_TRACE_TIMER_INFO_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_GCFE_TRACE_TIMER_INFO_IND_param.";
	var result = "";

	var timer_status = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"timer_status")));
	result = timer_status + TYPE_SEP2;

	var timer_id     = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"timer_id")));
	result += "timer_id:"+timer_id;

	return result;

}


///////////////////////////////////////////////////////////////////////-----------
function process__P_DIAG_EXT_EXCEPTION_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "P_DIAG_EXT_EXCEPTION_IND_param.";
	var result = "";

	var err_class = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"err_class")));
	result = err_class+TYPE_SEP2;


	return result;
}


//add for TDSCDMA  TRRC-----end


//add for TDSCDMA FW--------start
///////////////////////////////////////////////////////////////////////-----------
function process__MSG_L1RESP_PC_NCELL_INFO_IND_4_L( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "ncell_info_4_ind_L.";//"MSG_L1RESP_PC_NCELL_INFO_IND_4_L.";
	var result = "";

	var u16_uarfcn = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"st_scell_info."+"u16_uarfcn")));
	var u8_cell_para_id = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"st_scell_info."+"u8_cell_para_id")));
	var serv_aver_RSCP = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"st_scell_info.s8_rscp_dbm")));
	result = "uarfcn:"+u16_uarfcn+"|"+"u8_cell_para_id:" + u8_cell_para_id+"|";
	result += "Serv Aver RSCP:" + EQUALS + serv_aver_RSCP+"dBm";

	var serv_current_RSCP = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"st_scell_info.s8_current_rscp_dbm")));
	result += " (current meas" + VALUE_SEP + serv_current_RSCP+"dBm)";

	//var local_frame_number = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_info_4_ind_L.st_scell_info.u16_uarfcn")));
	//result += " Lsfn:" + local_frame_number;

	return result;
}


///////////////////////////////////////////////////////////////////////-----------
function process__MSG_COM_PSD_TASK_PC_PRINT_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "printf_req.";//"MSG_COM_PSD_TASK_PC_PRINT_IND.";
	var result = "";

	//var line_no = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u16_line_no")));
	//result = line_no;
	//return result;


	var bContent = getContentSafely(msg);
	var biStream = new ByteArrayInputStream(bContent);
	var iStream = new DataInputStream(biStream);
	var result = "";

	var PayloadName = getPayloadName(msg);
	//if (PayloadName == "Message content")
		iStream.skipBytes(28);

	var length = iStream.readUnsignedByte();
	iStream.skipBytes(3);
	//return length;
	for (var i=0; i<parseInt(length); i++)
	{
		var val = iStream.readUnsignedByte();
		result += String.fromCharCode(parseInt(val));
		//result += val;
	}

	return result;
}

///////////////////////////////////////////////////////////////////////-----------
function process__MSG_COM_PSD_TASK_PC_L1STATE_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "l1state_ind.";//"MSG_L1RESP_PC_NCELL_INFO_IND_4_L.";
	var result = "";

	var l1_state = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u8_l1_state")));
	result = "L1 State: " + l1_state;

	return result;
}

///////////////////////////////////////////////////////////////////////-----------
function process__MSG_DWCCT_L1RESP_PICH_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "pich_ind.";//"MSG_DWCCT_L1RESP_PICH_IND.";
	var result = "";

	var pch_exist = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u8_pch_ind")));
	result = pch_exist+TYPE_SEP2;

	var valid_pi_amt = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u8_valid_pi_amt")));
	result += "Valid_pi_amt:"+valid_pi_amt+TYPE_SEP2;

	var subsfn = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u16_recv_subsfn")));
	result += "Recv_SubSFN:"+subsfn+TYPE_SEP2;

	//var local_frame_number = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"ncell_info_4_ind_L.st_scell_info.u16_uarfcn")));
	//result += " Lsfn:" + local_frame_number;

	return result;
}

///////////////////////////////////////////////////////////////////////-----------
function process__MSG_CST_PC_FS_LOGGING_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "MSG_CST_PC_FS_LOGGING_IND.";//"MSG_CST_PC_FS_LOGGING_IND.";
	var result = "";

	var uarfcn = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"st_fs_info.u16_uarfcn")));
	result = "uarfcn: " + uarfcn + TYPE_SEP2;

	var set_agc = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"st_fs_info.s16_set_agc")));
	result += "set_agc: " + set_agc + TYPE_SEP2;

	var fs_agc = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"st_fs_info.s16_fs_agc")));
	result += "fs_agc: " + fs_agc + TYPE_SEP2;

	return result;
}

///////////////////////////////////////////////////////////////////////-----------
function process__MSG_IQPREPRO_L1MEAS_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "iqprepro_l1meas_req.";//"MSG_IQPREPRO_L1MEAS_REQ.";
	var result = "";

	var task = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"e_ts_task")));
	result = task+TYPE_SEP2;

	var uarfcn = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u16_uarfcn")));
	result += "Uarfcn:"+uarfcn+TYPE_SEP2;

	return result;
}

///////////////////////////////////////////////////////////////////////-----------
function process__MSG_JDT_L1RESP_SMALL_L_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "jdt2l1resp_small_L_ind.";//"MSG_JDT_L1RESP_SMALL_L_IND.";
	var result = "";

	var uarfcn = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u16_uarfcn")));
	result = "Uarfcn:"+uarfcn+TYPE_SEP2;

	var meas_cell_amt = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u8_meas_cell_amt")));
	result += "meas cell count:"+meas_cell_amt+TYPE_SEP2;

	var ts_cctrch_amt = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelFW, msg, PayloadName, MsgName+"u8_ts_cctrch_amt")));
	result += "ts cctrch count:"+ts_cctrch_amt+TYPE_SEP2;
	return result;
}

function process__MSG_AJD_PC_HSSCCH_INFO( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "hsscch_info.";
	var result = "";

	var b6_tbs = stripQuotes_new(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"st_hsscch_dec_output."+"b6_tbs")));
	var b_mf = stripQuotes_new(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"st_hsscch_dec_output."+"b_mf")));
	var b3_hcsn = stripQuotes_new(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"st_hsscch_dec_output."+"b3_hcsn")));

	result = "TBS:"+b6_tbs+"|"+"modulation:" + b_mf+"|"+"hcsn:"+b3_hcsn;

	return result;
}
function process__MSG_HSDSCCT_PC_HSPDSCH_INFO_IND( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "hspdsch_info.";
	var result = "";

	var ack = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"u8_crc")));
	if (ack.equals("CRCcorrect "))
	result = "ACK";
	else
	result = "NACK";
	return result;
}

function process__MSG_DWCCT_EAGCH_INFO( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "eagch_dec_info.";
	var result = "";

	var b3_eagch_info_ecsn = stripQuotes_new(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"b3_eagch_info_ecsn")));
	var b5_eagch_info_trri = stripQuotes_new(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"b5_eagch_info_trri")));
	var b5_eagch_info_crri = stripQuotes_new(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"b5_eagch_info_crri")));
	var b5_eagch_info_prri = stripQuotes_new(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"b5_eagch_info_prri")));

	//var tmp_1 = stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"b3_eagch_info_ecsn"));
	//var tmp_2 = stripQuotes_new(tmp_1);
	result = "escn:"+b3_eagch_info_ecsn+"|"+"trri:" + b5_eagch_info_trri+"|"+"crri:"+b5_eagch_info_crri+"|"+"prri:"+b5_eagch_info_prri;
	//result = tmp_1 + tmp_2;
	return result;
}
function process__MSG_MACE_UPCCT_ENC_REQ( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "enc_req.";
	var result = "";	

	var u8_e_tfci = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"u8_e_tfci")));
	var u8_modulation = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"st_edch_para.u8_modulation")));
	var s8_power_db = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"s8_power_db")));

	result = "e_TFCI:"+u8_e_tfci+"|"+"modulation:" + u8_modulation+"|"+"TX Power:"+s8_power_db;

	return result;
}


function process__MSG_DWCCT_EHICH_INFO( msg )
{
	var PayloadName = getPayloadName(msg);
	var MsgName = "ehich_dec_info.";
	var result = "";

	var ack = stripQuotes(stripLiteralText(service.getDecodedStructValue(PanelPS, msg, PayloadName, MsgName+"b1_ack_nack")));
	if (ack.equals("ack[0x1, 1(1 bits)]"))
	result = "ACK";
	else
	result = "NACK";
	return result;
}

//add for TDSCDMA FW--------end

//////////////////////////////////////////////////
function updateColumn_MID0( msg )
{
	var MessageSource = msg.getMessageType();
	var curMsg = msg.getValue( MsgPS );

	if (IsEmpty(curMsg))
		return( "" );

	if (MessageSource.equals("ver_sw")) return updateColumn_MID0_Ver_SW( msg );// _MT = 2
	if (MessageSource.equals("ver_hw")) return updateColumn_MID0_Ver_SW( msg );// _MT = 1
	if (MessageSource.equals("trap"))   return updateColumn_MID0_Trap( msg );// _MT = 3

	if (strStartsWith( curMsg, "Timer ID = ")) return( process__Timer( msg ));

	try {
		var result = "";
		var myMsg = new String( curMsg );

		var indexSpace = myMsg.indexOf( "\n");
		if (indexSpace != -1)
			myMsg = myMsg.substring( 0, indexSpace);
		indexSpace = myMsg.indexOf( " ");
		if (indexSpace != -1)
			myMsg = myMsg.substring( 0, indexSpace);
		indexSpace = myMsg.indexOf( ".");
		if (indexSpace != -1)
			myMsg = myMsg.substring( 0, indexSpace);

		switch (myMsg.toString())
		{
		case "CORE_DUMP":                                                                              return( process__CORE_DUMP( msg ));
		case "ULA_Trace_ERRC_PLMN_CNF_Parameters_s":                                                   return( process__ULA_Trace_ERRC_PLMN_CNF_Parameters_s( msg ));

		//add for TDSCDMA-----start
		case "P_L1_HLS_L1TDE_IRAT_IND(L1ETD_IRAT_SERVICE_REQ)":                                        return( process__L1ETD_IRAT_SERVICE_REQ( msg ));
		case "P_L1_HLS_L1TDE_IRAT_IND(L1ETD_MASTER_RAT_REQ)":                                          return( process__L1ETD_MASTER_RAT_REQ( msg ));
		case "P_L1_HLS_L1TDE_IRAT_IND(L1ETD_IRAT_CELL_LIST_REQ)":                                      return( process__L1ETD_IRAT_CELL_LIST_REQ( msg ));
		case "P_L1_HLS_L1TDE_IRAT_IND(L1ETD_IRAT_MEAS_REQ)":                                           return( process__L1ETD_IRAT_MEAS_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1ETD_IRAT_MEAS_REPORT_IND)":                                          return( process__L1ETD_IRAT_MEAS_REPORT_IND( msg ));
		case "P_L1_HLS_L1TDG_IRAT_IND(L1GTD_IRAT_SERVICE_REQ)":                                        return( process__L1GTD_IRAT_SERVICE_REQ( msg ));
		case "P_L1_HLS_L1TDG_IRAT_IND(L1GTD_MASTER_RAT_REQ)":                                          return( process__L1GTD_MASTER_RAT_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDE_IRAT_SERVICE_REQ)":                                              return( process__L1TDE_IRAT_SERVICE_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDE_MASTER_RAT_REQ)":                                                return( process__L1TDE_MASTER_RAT_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDE_UTRAN_IRAT_CELL_LIST_REQ)":                                      return( process__L1TDE_UTRAN_IRAT_CELL_LIST_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDE_UTRAN_IRAT_MEAS_REQ)":                                           return( process__L1TDE_UTRAN_IRAT_MEAS_REQ( msg ));
		case "P_L1_HLS_L1TDE_IRAT_IND(L1TDE_UTRAN_IRAT_MEAS_REPORT_IND)":                              return( process__L1TDE_UTRAN_IRAT_MEAS_REPORT_IND( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDE_GERAN_IRAT_CELL_LIST_REQ)":                                      return( process__L1TDE_GERAN_IRAT_CELL_LIST_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDE_GERAN_IRAT_MEAS_REQ)":                                           return( process__L1TDE_GERAN_IRAT_MEAS_REQ( msg ));
		case "MSG_L1TDE_GERAN_IRAT_MEAS_REPORT_IND":                                                   return( process__L1TDE_GERAN_IRAT_MEAS_REPORT_IND( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDG_IRAT_SERVICE_REQ)":                                              return( process__L1TDG_IRAT_SERVICE_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDG_MASTER_RAT_REQ)":                                                return( process__L1TDG_MASTER_RAT_REQ( msg ));
		case "P_HLS_L1_IRAT_IND(L1TDG_UTRAN_IRAT_CELL_LIST_REQ)":                                      return( process__L1TDG_UTRAN_IRAT_CELL_LIST_REQ( msg ));
		case "MSG_L1TDG_UTRAN_IRAT_MEAS_REQ":                                                          return( process__L1TDG_UTRAN_IRAT_MEAS_REQ( msg ));
		case "P_L1_HLS_L1TDG_IRAT_IND(L1TDG_UTRAN_IRAT_MEAS_REPORT_IND)":                              return( process__L1TDG_UTRAN_IRAT_MEAS_REPORT_IND( msg ));
		case "TRRC_ACT_REQ":                                                                           return( process__TRRC_ACT_REQ( msg ));
		case "TRRC_ACT_IND":                                                                           return( process__TRRC_ACT_IND( msg ));
		case "TRRC_ACT_FAIL":                                                                          return( process__TRRC_ACT_FAIL( msg ));
		case "TRRC_UPDATE_UPLMN_REQ":                                                                  return( process__TRRC_UPDATE_UPLMN_REQ( msg ));
		case "TRRC_PLMN_REQ":                                                                          return( process__TRRC_PLMN_REQ( msg ));
		case "TRRC_CELL_PARAMETER_REQ":                                                                return( process__TRRC_CELL_PARAMETER_REQ( msg ));
		case "TRRC_CELL_PARAMETER_IND":                                                                return( process__TRRC_CELL_PARAMETER_IND( msg ));
		case "TRRC_SIM_INFO_REQ":                                                                      return( process__TRRC_SIM_INFO_REQ( msg ));
		case "TRRC_UPDATE_PARAM_REQ":                                                                  return( process__TRRC_UPDATE_PARAM_REQ( msg ));
		case "TRRC_SECURITY_RES":                                                                      return( process__TRRC_SECURITY_RES( msg ));
		case "TRRC_GMM_ESTABLISH_REQ":                                                                 return( process__TRRC_GMM_ESTABLISH_REQ( msg ));
		case "TRRC_GMM_SECURITY_RES":                                                                  return( process__TRRC_GMM_SECURITY_RES( msg ));
		case "TRRC_GMM_UPDATE_PARAM_REQ":                                                              return( process__TRRC_GMM_UPDATE_PARAM_REQ( msg ));
		case "TRRC_FD_CONFIG_REQ":                                                                     return( process__TRRC_FD_CONFIG_REQ( msg ));
		case "TRRC_RXSTAT_IND":                                                                        return( process__TRRC_RXSTAT_IND( msg ));
		case "TRRC_SET_INACTIVE_REQ":                                                                  return( process__TRRC_SET_INACTIVE_REQ( msg ));
		case "TRRC_RESEL_REQ":                                                                         return( process__TRRC_RESEL_REQ( msg ));
		case "TRRC_RESEL_REJ":                                                                         return( process__TRRC_RESEL_REJ( msg ));
		case "TRRC_RESEL_CNF":                                                                         return( process__TRRC_RESEL_CNF( msg ));
		case "P_DIAG_EXT_PRINT_IND":                                                                   return( process__P_DIAG_EXT_PRINT_IND( msg ));
		case "TRRC_EST_REQ":                                                                           return( process__TRRC_EST_REQ( msg ));
		case "TRRC_ABORT_REQ(Unknown NAS Msg[CS][U])":                                                 return( process__TRRC_ABORT_REQ( msg ));
		// case "TRRC_ABORT_REQ":                                                                         return( process__TRRC_ABORT_REQ( msg ));
		case "P_HLS_L1_RL_SETUP_REQ":                                                                  return( process__P_HLS_L1_RL_SETUP_REQ( msg ));
		case "P_HLS_L1_RL_MODIFY_REQ":                                                                 return( process__P_HLS_L1_RL_MODIFY_REQ( msg ));
		case "P_HLS_L1_STATECHG_IND":                                                                  return( process__P_HLS_L1_STATECHG_IND( msg ));
		//case "TRRC_GMM_RELEASE_REQ":                                                                   return( process__TRRC_GMM_RELEASE_REQ( msg ));
		case "TRRC_GMM_RELEASE_REQ(Unknown NAS Msg[PS][U])":                                           return( process__TRRC_GMM_RELEASE_REQ( msg ));
		case "TRRC_ENABLED_RATS_REQ":                                                                  return( process__TRRC_ENABLED_RATS_REQ( msg ));
		case "P_DIAG_EXT_ACCESS_CNF":                                                                  return( process__P_DIAG_EXT_ACCESS_CNF( msg ));
		case "P_L1_HLS_INIT_IND":                                                                      return( process__P_L1_HLS_INIT_IND( msg ));
		case "P_HLS_L1_UEINFO_REQ":                                                                    return( process__P_HLS_L1_UEINFO_REQ( msg ));
		case "P_HLS_L1_SERVICE_IND":                                                                   return( process__P_HLS_L1_SERVICE_IND( msg ));
		case "P_HLS_L1_CELLSEARCH_REQ":                                                                return( process__P_HLS_L1_CELLSEARCH_REQ( msg ));
		case "P_L1_HLS_CELLSEARCH_CNF":                                                                return( process__P_L1_HLS_CELLSEARCH_CNF( msg ));
		case "P_L1_HLS_SEARCHNEXT_CNF":                                                                return( process__P_L1_HLS_SEARCHNEXT_CNF( msg ));
		case "P_HLS_L1_MEASURE_REQ":                                                                   return( process__P_HLS_L1_MEASURE_REQ( msg ));
		case "P_L1_HLS_MEASURE_IND":                                                                   return( process__P_L1_HLS_MEASURE_IND( msg ));
		case "P_L1_HLS_MEASEVA_IND":                                                                   return( process__P_L1_HLS_MEASEVA_IND( msg ));
		case "P_RRC_PHY_SFN_IND":                                                                      return( process__P_RRC_PHY_SFN_IND( msg ));
		case "P_L1_HLS_READBCH_IND":                                                                   return( process__P_L1_HLS_READBCH_IND( msg ));
		case "P_GCFE_TRACE_TIMER_INFO_IND":                                                            return( process__P_GCFE_TRACE_TIMER_INFO_IND( msg ));
		case "P_DIAG_EXT_EXCEPTION_IND":                                                               return( process__P_DIAG_EXT_EXCEPTION_IND( msg ));
		//add for TDSCDMA-----end
		}

		if (result.equals(""))
			result = getEXTRA_INFO( msg );
		return( result );
	} catch(e) {
		logException( e );
	}

	return updateColumn__DefaultMsg( msg );
}


//////////////////////////////////////////////////
function updateColumn_MID112( msg )
{
	var MessageSource = msg.getMessageType();
	var curMsg = msg.getValue( MsgFW );

	if (IsEmpty(curMsg))
		return( "" );

	if (strStartsWith( curMsg, "Timer ID = ")) return( process__Timer( msg ));

	try {
		var result = "";
		var myMsg = new String( curMsg );

		var indexSpace = myMsg.indexOf( "\n");
		if (indexSpace != -1)
			myMsg = myMsg.substring( 0, indexSpace);
		indexSpace = myMsg.indexOf( " ");
		if (indexSpace != -1)
			myMsg = myMsg.substring( 0, indexSpace);
		indexSpace = myMsg.indexOf( ".");
		if (indexSpace != -1)
			myMsg = myMsg.substring( 0, indexSpace);

		switch (myMsg.toString())
		{
		case "CORE_DUMP":                                                                              return( process__CORE_DUMP( msg ));

		//add for TDSCDMA FW--start
		case "MSG_L1RESP_PC_NCELL_INFO_IND_4_L":                                                       return( process__MSG_L1RESP_PC_NCELL_INFO_IND_4_L( msg ));
		case "MSG_COM_PSD_TASK_PC_PRINT_IND":                                                          return( process__MSG_COM_PSD_TASK_PC_PRINT_IND( msg ));
		case "MSG_COM_PSD_TASK_PC_L1STATE_IND":                                                        return( process__MSG_COM_PSD_TASK_PC_L1STATE_IND( msg ));
		case "MSG_CST_PC_FS_LOGGING_IND":                                                              return( process__MSG_CST_PC_FS_LOGGING_IND( msg ));
		case "MSG_IQPREPRO_L1MEAS_REQ":                                                                return( process__MSG_IQPREPRO_L1MEAS_REQ( msg ));
		case "MSG_JDT_L1RESP_SMALL_L_IND":                                                             return( process__MSG_JDT_L1RESP_SMALL_L_IND( msg ));

		//case "MSG_L1RESP_PC_NCELL_INFO_IND_4_L":                                                       return( process__MSG_L1RESP_PC_NCELL_INFO_IND_4_L( msg ));
		case "MSG_AJD_PC_HSSCCH_INFO":                                                                 return( process__MSG_AJD_PC_HSSCCH_INFO( msg ));
		case "MSG_HSDSCCT_PC_HSPDSCH_INFO_IND":                                                        return( process__MSG_HSDSCCT_PC_HSPDSCH_INFO_IND( msg ));
		case "MSG_DWCCT_EAGCH_INFO":                                                                   return( process__MSG_DWCCT_EAGCH_INFO( msg ));
		case "MSG_MACE_UPCCT_ENC_REQ":                                                                 return( process__MSG_MACE_UPCCT_ENC_REQ( msg ));
		case "MSG_DWCCT_EHICH_INFO":                                                                   return( process__MSG_DWCCT_EHICH_INFO( msg ));

		//add for TDSCDMA FW--end
		}
		if (result.equals(""))
			result = getEXTRA_INFO( msg );
		return( result );
	} catch(e) {
		logException( e );
	}

	return updateColumn__DefaultMsg( msg );
}


//////////////////////////////////////////////////
function updateColumn( msg )
{
	globalIndex = msg.getMsgIndex();
	logMessage("globalIndex="+globalIndex);
	logMessage("msg.getMid()="+msg.getMid());

/*
	var result;
	var start = new Date().getTime();
	for (var loop = 0; loop < 10000; loop++)
	{
		try {
					if (msg.getMid() == 0)  result = updateColumn_MID0( msg );
			else							result = updateColumn__DefaultMsg( msg );
		} catch(e) {
			logException( e );
		}
	}
	var end = new Date().getTime();
	var time = end - start;
	logMessage("globalIndex="+globalIndex+"    Duration="+time );
	return result;
*/
	try {
		if (msg.getMid() == 0)  return updateColumn_MID0( msg );
		if (msg.getMid() == 112) return updateColumn_MID112( msg );
		return updateColumn__DefaultMsg( msg );
	} catch(e) {
		logException( e );
	}
}

