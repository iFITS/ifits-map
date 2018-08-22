
function pickGpsData(all_data)
{
    var count=0,ret_data = [],latitude,ns,longitude,ew,speed,direction;

    var center = [];

    for(var i = 1; i < (all_data.length); i++)
    {
        //console.log("all_data["+i+"]="+all_data[i]);
        var image =null;
        latitude = all_data[i][1];
        ns = all_data[i][2];
        longitude = all_data[i][3];
        ew = all_data[i][4];
        speed = all_data[i][5];
        direction = all_data[i][6];

        latitude = parseInt(latitude/100) + (latitude%100)/60
        longitude = parseInt(longitude/100) + (longitude%100)/60

        if(ns=="S")
            latitude = -latitude
        if(ew=="W")
            longitude = -longitude

        ret_data[count] = [latitude, longitude, speed, direction, "GpsMarker.png"];
         count++;
    }

    return ret_data;
}


function pickEventData(all_data, type)
{
    var count=0,ret_data = [],latitude,ns,longitude,ew,speed,direction,rsrp,rsrq,rssnr,pci,earfcn;

    for(var i = 1; i < (all_data.length); i++)
    {
        //console.log("all_data["+i+"]="+all_data[i]);
        var image =null;
        latitude = all_data[i][1];
        ns = all_data[i][2];
        longitude = all_data[i][3];
        ew = all_data[i][4];
        speed = all_data[i][5];
        direction = all_data[i][6];
        index = all_data[i][7];
        rsrp = all_data[i][8];
        rsrq = all_data[i][9];
        rssnr = all_data[i][10];
        pci = all_data[i][11];
        earfcn = all_data[i][12];

        latitude = parseInt(latitude/100) + (latitude%100)/60
        longitude = parseInt(longitude/100) + (longitude%100)/60

        if(ns=="S")
            latitude = -latitude
        if(ew=="W")
            longitude = -longitude

        if(rsrp!=null)
            rsrp = rsrp/100.0
        if(rsrq!=null)
            rsrq = rsrq/100.0
        if(rssnr!=null)
            rssnr = rssnr/100.0

        if(type=="rsrp" && rsrp!=null)
        {
            switch(true)
            {
                case (rsrp>=-50):
                    image = "LightGreenPcellRsrpBox.png";
                    break;
                case (rsrp>=-80 && rsrp<-50):
                    image = "GrassGreenPcellRsrpBox.png";
                    break;
                case (rsrp>=-100 && rsrp<-80):
                    image = "YellowPcellRsrpBox.png";
                    break;
                case (rsrp>=-120 && rsrp<-100):
                    image = "OrangePcellRsrpBox.png";
                    break;
                case (rsrp<-120):
                    image = "RedPcellRsrpBox.png";
                    break;
            }
        }

        if(type=="rsrq" && rsrq!=null)
        {
            switch(true)
            {
                case (rsrq>=-7):
                    image = "LightGreenPcellRsrqBox.png";
                    break;
                case (rsrq>=-11.5 && rsrq<-7):
                    image = "GrassGreenPcellRsrqBox.png";
                    break;
                case (rsrq>=-15.5 && rsrq<-11.5):
                    image = "YellowPcellRsrqBox.png";
                    break;
                case (rsrq>=-18 && rsrq<-15.5):
                    image = "OrangePcellRsrqBox.png";
                    break;
                case (rsrq<-18):
                    image = "RedPcellRsrqBox.png";
                    break;
            }
        }
        if(image==null)
        {
            continue;
        }

        ret_data[count] = [latitude, longitude, 'XMM7160_MUC_MobilityXFTHrping_30JUL2014_O2_trace_01', index , rsrp,
         rsrq,0.0,0.0,0.0,0.0, 'VoLTE Call State: Dialing','T310 Expired',12,'other',0.032,0.028,0.027,0.0,0.0,0.0,0.0,0.0, image];
         count++;
    }

    return ret_data;
}


function selectData(data, selectedList)
{
    var count=0,ret_data = [];

    var center = [];

    for(var i = 1; i < (data.length); i++)
    {
        //console.log("all_data["+i+"]="+all_data[i]);
        var image =null;
        latitude = all_data[i][1];
        ns = all_data[i][2];
        longitude = all_data[i][3];
        ew = all_data[i][4];
        speed = all_data[i][5];
        direction = all_data[i][6];

        latitude = parseInt(latitude/100) + (latitude%100)/60
        longitude = parseInt(longitude/100) + (longitude%100)/60

        if(ns=="S")
            latitude = -latitude
        if(ew=="W")
            longitude = -longitude

        ret_data[count] = [latitude, longitude, speed, direction, "GpsMarker.png"];
         count++;
    }

    return ret_data;
}


function cleanData(all_data)
{
    var count=1,ret_data = [['datetime','latitude','longitude','speed','direction','index','rsrp','rsrq','rssnr','pci','earfcn']];
    var datetime,latitude,ns,longitude,ew,speed,direction,rsrp,rsrq,rssnr,pci,earfcn;

    for(var i = 1; i < (all_data.length); i++)
    {
        var image =null;
        datetime = all_data[i][0];
        latitude = all_data[i][1];
        ns = all_data[i][2];
        longitude = all_data[i][3];
        ew = all_data[i][4];
        speed = all_data[i][5];
        direction = all_data[i][6];
        index = all_data[i][7];
        rsrp = all_data[i][8];
        rsrq = all_data[i][9];
        rssnr = all_data[i][10];
        pci = all_data[i][11];
        earfcn = all_data[i][12];

        latitude = parseInt(latitude/100) + (latitude%100)/60
        longitude = parseInt(longitude/100) + (longitude%100)/60

        if(ns=="S")
            latitude = -latitude
        if(ew=="W")
            longitude = -longitude

        if(rsrp!=null)
            rsrp = rsrp/100.0
        if(rsrq!=null)
            rsrq = rsrq/100.0
        if(rssnr!=null)
            rssnr = rssnr/100.0

        ret_data[count] = [datetime, latitude, longitude, speed, direction, index , rsrp, rsrq,rssnr, pci, earfcn];
        count++;
    }

    return ret_data;
}


