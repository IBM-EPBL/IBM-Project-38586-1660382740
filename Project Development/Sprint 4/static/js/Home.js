(function () {
    // IIFE
    var images = [];
    var currIndex = 0;
    const container1 = document.querySelector(".container-1");
    const container2 = document.querySelector(".container-2");
    const imageContainer = document.querySelector(".image-viewer");
    const video = document.querySelector("#video-container");
    var socket = io('http://localhost:5000');

    socket.on('connect', function () {
        console.log("Connected...!", socket.connected)
    });

    const getFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg');
        return data;
    }


    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err0r) {
                console.log(err0r)
                console.log("Something went wrong!");
            });
    }

    const loadImages = () => {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            if (images[currIndex].type.match("image")) {
                const picReader = new FileReader();
                picReader.addEventListener("load", function (event) {
                    const picFile = event.target;
                    imageContainer.setAttribute("src", picFile.result);
                    imageContainer.setAttribute("title", picFile.name);
                });
                picReader.readAsDataURL(images[currIndex]);
            }
        } else {
            alert("Your browser does not support File API");
        }
    }

    const moveLeft = () => {
        if (currIndex == 0) currIndex = images.length - 1;
        else currIndex = currIndex - 1;
    }

    const moveRight = () => {
        currIndex = (currIndex + 1) % images.length;
    }

    const zoomIn = () => {
        imageContainer.classList.add("zoomIn");
    }

    const zoomOut = () => {
        imageContainer.classList.remove("zoomIn");
    }

    const blurIn = () => {
        imageContainer.classList.add("blurIn");
    }

    const blurOut = () => {
        imageContainer.classList.remove("blurIn");
    }

    const rotateClockwise = () => {
        imageContainer.classList.add("rotate");
    }

    const rotateAntiClockwise = () => {
        imageContainer.classList.remove("rotate");
    }

    const flipIn = () => {
        imageContainer.classList.add("flip");
    }

    const flipOut = () => {
        imageContainer.classList.remove("flip");
    }


    document.onkeyup = (e) => {
        if (images.length > 0) {
            if (e.keyCode == 37) {
                moveLeft();
            } else if (e.keyCode == 39) {
                moveRight();
            } else if (e.keyCode == 38) {
                zoomIn();
            } else if (e.keyCode == 40) {
                zoomOut();
            }
        }
        loadImages();
    }

    document.querySelector(".sub-container-start-btn").addEventListener("click", (e) => {
        if (images.length > 0) {
            container1.classList.remove("hidden");
            container2.classList.add("hidden");
            loadImages();
        }
    })

    document.querySelector("#files").addEventListener("change", (e) => {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            images = e.target.files;
        }
    });

    socket.on('response_back', function (response) {
        let res = response.result
        flipOut();
        zoomOut();
        rotateAntiClockwise();
        blurOut();
        if (res == 0) moveLeft();
        else if (res == 1) moveRight();
        else if (res == 2) flipIn();
        else if (res == 3) rotateClockwise();
        else if (res == 4) zoomIn();
        else if (res == 5) blurIn();
        loadImages();
    });

    const sendImage = () => {
        var type = 'image/png';
        var data = canvas.toDataURL();
        console.log("data", data, images[currIndex]);
        data = data.replace('data:' + type + ';base64,', '');
        socket.emit('image', data);
    }

    setInterval(async () => {
        // if (video.getAttribute("src") != null) {
        if (images.length >= currIndex && images[currIndex] != null) {
            console.log("Sending...");
            let data = getFrame();
            socket.emit('image', data);
        }
        // }
    }, 2000)
})();
