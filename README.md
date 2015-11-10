# ElevationProfileNew
CMV Widget based on <a href="https://github.com/goriliukasbuxton/ElevationProfile2">@goriliukasbuxton's </a> wonderful approach 
just added some minor features

1. comnbined the setting to one
2. added the map click logic for detach or attach the default map click event
3. Open the buttom pane when use clicks the draw button

            elevation: {
                include: true,
                id: 'elevationnew',
                type: 'titlePane',
                path: 'widgets/ElevationProfile',
                canFloat: true,
                title: '<i class="icon-large icon-road"></i>&nbsp;&nbsp;Elevation Profile',
                open: false,
                position: 25,
                options: {
                    map: true
                }
            },
  
![alt tag](/Capture.PNG)            
            
