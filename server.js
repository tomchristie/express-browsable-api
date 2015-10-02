var express = require('express')
var exphbs  = require('express-handlebars')
var bodyParser = require('body-parser')
var app = express()


var statusText = {
    100: 'Continue',
    101: 'Switching Protocols',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: 'Reserved',
    307: 'Temporary Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request Uri Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    511: 'Network Authentication Required'
}


var contentNegotiation = function (req, res, next) {
    // Return either HTML or JSON, depending on request 'Accept' header.
    // Invoked when using `res.sendData(...)`.
    var accept = req.headers['accept']
    var elements = accept.split(',')
    var useHtml = false
    for (idx = 0; idx < elements.length; idx++) {
        var element = elements[idx].split(';')[0]
        if (element == 'text/html') {
            useHtml = true
            break
        }
	}
    res.sendData = function (data) {
        var body = JSON.stringify(data, null, '    ')
        if (useHtml) {
            this.render('index', {
                code: this.statusCode,
                statusText: statusText[this.statusCode] || '',
                body: body
            })
        } else {
            this.send(body)
        }
    }
    next()
}


var errorHandler = function(err, req, res, next) {
    // Ensure that errors are content negotiated too.
    res.status(500).sendData({'error': err.stack.split(':')[0]});
}


app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')
app.use(contentNegotiation)
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(errorHandler)

app.all('/*', function (req, res) {
    res.sendData({
        'method': req.method,
        'headers': req.headers,
        "body": req.body
    })
})

app.listen(3000)
