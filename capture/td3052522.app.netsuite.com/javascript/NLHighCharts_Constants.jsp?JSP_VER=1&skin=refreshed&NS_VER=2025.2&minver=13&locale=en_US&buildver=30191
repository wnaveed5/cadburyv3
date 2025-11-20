












function NLUIChartType()
{
   this.AREA = 'area';
   this.BAR = 'bar';
   this.COLUMN = 'column';
   this.LINE = 'line';
   this.SPLINE = 'spline';
   this.PIE = 'pie';
   this.KPI_METER = 'KPIMeter';
}

function NLSnapshotType()
{
    this.KPIPORTLET = 'KPIPORTLET';
    this.TRENDGRAPH = 'TRENDGRAPH';
    this.KPIREPORT = 'KPIREPORT';
    this.ONDEMAND = 'ONDEMAND';
    this.SEARCH_RESULT = 'SEARCH_RESULT';
}

function NLChartThemeType()
{
    this.BASIC = 'basic';
    this.COLORFUL = 'colorful';
    this.MCT = 'match_color_theme_bold';
    this.MCT2 = 'match_color_theme_light';
}

function NLChartBackgroundType()
{
    this.GLOBAL = 'global_background';
    this.LINES = 'lines';
    this.BANDS = 'bands';
    this.GRID = 'grid';
}

function NLChartMeterColors()
{
    this.RED_CENTER_DISK = '#D22332';
    this.RED_OUTER_RING = 'rgba(239, 85, 65, 0.1)';
    this.RED_DIAL_LAYER = 'rgba(210, 35, 50, 0.014)';
    this.RED_TEXT_SHADOW = '#ad050a';

    this.YELLOW_CENTER_DISK = '#fcd330';
    this.YELLOW_OUTER_RING = 'rgba(252,211,48,0.08)';
    this.YELLOW_DIAL_LAYER = 'rgba(252,211,48,0.014)';
    this.YELLOW_TEXT_SHADOW = '#e19415';

    this.GREEN_CENTER_DISK = '#8EC855';
    this.GREEN_OUTER_RING = 'rgba(103, 185, 108, 0.1)';
    this.GREEN_DIAL_LAYER = 'rgba(142,200,85,0.014)';
    this.GREEN_TEXT_SHADOW = '#4f9d1c';
}

function NLChartContextStrings()
{
    this.IN_THOUSANDS = 'In Thousands';
    this.IN_MILLIONS = 'In Millions';
    this.IN_BILLIONS = 'In Billions';
    this.KILO = 'K';
    this.MILLION = 'M';
    this.BILLION = 'B';
    this.TREND_TITLE = '{1} Trend';
    this.THRESHOLD = 'Threshold';
    this.COMPARISON_NOT_SUPPORT_ALERT = 'Comparison data is currently supported only for Monthly and Quarterly time ranges.';
    this.LOADING = 'Loading';
    this.RESET = 'Reset';
	this.MENU = 'Chart context menu';
    this.PLEASE_SET_UP_THIS_METER = 'Please set up this meter';

    this.JAN = 'January';
    this.FEB = 'February';
    this.MAR = 'March';
    this.APR = 'April';
    this.MAY = 'May';
    this.JUN = 'June';
    this.JUL = 'July';
    this.AUG = 'August';
    this.SEP = 'September';
    this.OCT = 'October';
    this.NOV = 'November';
    this.DEC = 'December';

    this.MON = 'Monday';
    this.TUE = 'Tuesday';
    this.WED = 'Wednesday';
    this.THU = 'Thursday';
    this.FRI = 'Friday';
    this.SAT = 'Saturday';
    this.SUN = 'Sunday';

}

function NLChartExportingTranslations() {
	this.DOWNLOAD_JPEG = 'Download JPG image';
	this.DOWNLOAD_PNG = 'Download PNG image';
	this.DOWNLOAD_PDF = 'Download PDF document';
	this.DOWNLOAD_SVG = 'Download SVG vector image';
	this.PRINT_CHART = 'Print the chart';
}

function NLChartImageResource()
{
    this.MESSAGEBOX_INFO = "/images/icons/messagebox/icon_msgbox_info.png";
}

var NLChartTypeInstance = new NLUIChartType();
var NLSnapshotTypeInstance = new NLSnapshotType();
var NLChartThemeTypeInstance = new NLChartThemeType();
var NLChartBackgroundTypeInstance = new NLChartBackgroundType();

var NLChartDataRequestBaseURL = '/app/elements/chart/NLChartRequestHandler.nl';

var NLChartMeterColorsInstance = new NLChartMeterColors();
var NLChartContextStringsInstance = new NLChartContextStrings();
var NLChartImageResourceInstance = new NLChartImageResource();

var NLChartExportingTranslationsInstance = new NLChartExportingTranslations();


//setting global HC language object
Highcharts.setOptions({
    lang: {
            months: [NLChartContextStringsInstance.JAN,NLChartContextStringsInstance.FEB,NLChartContextStringsInstance.MAR,NLChartContextStringsInstance.APR,NLChartContextStringsInstance.MAY,NLChartContextStringsInstance.JUN,NLChartContextStringsInstance.JUL,NLChartContextStringsInstance.AUG,
            NLChartContextStringsInstance.SEP,NLChartContextStringsInstance.OCT,NLChartContextStringsInstance.NOV,NLChartContextStringsInstance.DEC],
            weekdays: [NLChartContextStringsInstance.SUN,NLChartContextStringsInstance.MON,NLChartContextStringsInstance.TUE,NLChartContextStringsInstance.WED,NLChartContextStringsInstance.THU,NLChartContextStringsInstance.FRI,NLChartContextStringsInstance.SAT],
            printChart: NLChartExportingTranslationsInstance.PRINT_CHART,
	        contextButtonTitle: NLChartContextStringsInstance.MENU,
            downloadJPEG: NLChartExportingTranslationsInstance.DOWNLOAD_JPEG,
            downloadPNG: NLChartExportingTranslationsInstance.DOWNLOAD_PNG,
            downloadPDF: NLChartExportingTranslationsInstance.DOWNLOAD_PDF,
            downloadSVG: NLChartExportingTranslationsInstance.DOWNLOAD_SVG
    }
});

if(!true)
{
    Highcharts.setOptions({
        lang: {
                shortMonths: [NLChartContextStringsInstance.JAN,NLChartContextStringsInstance.FEB,NLChartContextStringsInstance.MAR,NLChartContextStringsInstance.APR,NLChartContextStringsInstance.MAY,NLChartContextStringsInstance.JUN,NLChartContextStringsInstance.JUL,NLChartContextStringsInstance.AUG,
                NLChartContextStringsInstance.SEP,NLChartContextStringsInstance.OCT,NLChartContextStringsInstance.NOV,NLChartContextStringsInstance.DEC],
                resetZoom: [NLChartContextStringsInstance.RESET]
        }
    });
}

// Set export preferences
Highcharts.setOptions({
	exporting: {
		url: "/core/media/export/NLSVGExporter.nl",
		width: 800
	}
});