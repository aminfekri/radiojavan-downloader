const app = angular.module('radiojavan', []);


app.controller('rdCtrl', function ($scope, $q, $http) {
    $scope.url = '';
    $scope.waiting = false;
    $scope.menubar = !window.api;
    $scope.download = async function () {
        let {url, waiting} = $scope;
        if (waiting) {
            return;
        }
        $scope.show_link = false;
        if (url) {
            try {
                $scope.waiting = true;
                $q(async (resolve, reject) => {
                    try {
                        const r = await handleAddDownloadButtons(url, $http);
                        resolve(r);
                    } catch (e) {
                        reject(e);
                    }
                }).then((w) => {
                    if (w) {
                        $scope.show_link = w;
                        if (window.api) {
                            window.api.send("copy-to-clipboard", w);
                            $scope.waiting = false;
                            $scope.copy = true;
                        } else {
                            $scope.waiting = false;
                            $scope.error_copy = true;
                            $scope.url = '';
                            setTimeout(() => {
                                $scope.error_copy = false;
                            }, 3000);
                        }
                    } else {
                        $scope.waiting = false;
                        $scope.error_net = true;
                        setTimeout(() => {
                            $scope.error_net = false;
                        }, 3000);

                    }
                }).catch((e) => {

                    $scope.waiting = false;
                    $scope.error_net = true;
                    setTimeout(() => {
                        $scope.error_net = false;
                    }, 3000);
                });

            } catch (e) {
                console.log(e);
                $scope.waiting = false;
                $scope.error_net = true;
                setTimeout(() => {
                    $scope.error_net = false;
                }, 3000);

            }

        } else {
            $scope.error_empty = true;
            setTimeout(() => {
                $scope.error_empty = false;
            }, 3000);

        }
    };
});

app.factory('handleAddDownloadButtons', (val) => {
});

function handleAddDownloadButtons(url, $http) {
    return new Promise((resolve, reject) => {
        let buttonLink = '', downloadLinkLow = '', downloadLinkHigh = '';
        let parsedUrl = '';
        try {
            parsedUrl = new URL(url);

        } catch (e) {
            reject();
        }
        let urlParts = parsedUrl.pathname.split('/');
        let musicName = urlParts[3];
        let loading = false;
        if (
            !loading &&
            (!downloadLinkHigh || (buttonLink !== downloadLinkHigh)) &&
            (urlParts[1] === 'mp3s' || 'podcasts' || 'videos')
        ) {
            loading = true;
            let formData = new FormData();
            formData.append('id', musicName);
            $http({
                method: 'POST',
                url: `https://www.radiojavan.com/${urlParts[1] === 'mp3s' ? 'mp3s/mp3_host' : urlParts[1] === 'podcasts' ? 'podcasts/podcast_host' : 'videos/video_host'}`,
                headers: {'Content-Type': undefined},
                data: formData
            }).then((succeededEvent) => {
                if (succeededEvent.status === 200 && succeededEvent.data?.host) {
                    let contentType = urlParts[1].slice(0, -1);
                    let host = succeededEvent.data.host;
                    downloadLinkLow = `${host}/media/${contentType === 'video' ? 'music_video' : contentType}/${contentType === 'video' ? 'lq' : 'mp3-256'}/${musicName}.${contentType === 'video' ? 'mp4' : 'mp3'}`;
                    downloadLinkHigh = `${host}/media/${contentType === 'video' ? 'music_video' : contentType}/${contentType === 'video' ? 'hq' : 'mp3-320'}/${musicName}.${contentType === 'video' ? 'mp4' : 'mp3'}`;
                    resolve(downloadLinkHigh);
                    buttonLink = downloadLinkHigh;
                    loading = false;
                } else {
                    reject();
                }
            }, (error) => {
                console.log(error);
                reject(erorr);
            });


        }
    });

}

