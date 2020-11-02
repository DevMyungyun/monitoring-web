function httpRequest(method, url, query, body) {
    var xhr;
    return new Promise(function(resolve, reject) {
        if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
            xhr = new XMLHttpRequest();
        } else { // code for IE6, IE5
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200 || xhr.status === 201) {
                    const res = JSON.parse(xhr.response)
                    if (res.code === "200" || res.code == "201") {
                        resolve(res);
                    } else if (res.code === "500") {
                        resolve(res)
                        // location.reload(true)
                    } else {
                        console.error(xhr.responseText);
                        // alert("Unexpected error");
                        reject(xhr.responseText)
                        xhr.abort()
                    }
                } else {
                    console.error(xhr.responseText);
                    reject(xhr.responseText)
                    xhr.abort()
                }
            }
        };
        xhr.open(method, url + query, true);
        xhr.setRequestHeader("Content-Type", "application/json")
        // xhr.onprogress = function () {
        //     console.log('LOADING: ', xhr.status);
        // };
        // xhr.onload = function () {
        //     console.log('DONE: ', xhr.status);
        // };
        if (body) {
            var jsonBody = JSON.stringify(body)
            try {
                xhr.send(jsonBody);
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                xhr.send();
            } catch (e) {
                console.log(e);
            }
        }
    });
    
}