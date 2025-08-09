import React, { useEffect } from 'react';

const Map = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=304f6dd93c56bc5f21d1a1b0f4ebcc73";
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                const container = document.getElementById('map');
                const options = {
                    center: new window.kakao.maps.LatLng(37.5665, 126.978),
                    level: 3
                };
                new window.kakao.maps.Map(container, options);
            });
        };

        document.body.appendChild(script);

        // 컴포넌트 언마운트 시 script 제거 → 재진입 시 다시 로드
        return () => {
            document.body.removeChild(script);
        };
    });

    return (
        <div id='map' style={{ width: 'min(100vw, 430px)', height: '100vh', margin: '0 auto' }}></div>
    );
};

export default Map;