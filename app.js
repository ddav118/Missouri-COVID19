function finalproject(){
    var filePath="covidMOclean.csv";
    viz1(filePath);
    question2(filePath);
    question3(filePath);
    question4(filePath);
    question5(filePath);
}

var svgwidth = 1050;
var svgheight = 600;
var margin = 60;
var h = svgheight-margin;
var w = svgwidth-margin;
var pad = 2;

//explain color scheme
//explain marks and channels
var viz1=function(filePath){
    var rowConverter = function(d){
        return {
            YearMonth: d.case_month,
            Year: parseInt(d.year),
            Month: parseInt(d.month),
            County: d.res_county,
            CountyFips: parseInt(d.county_fips_code),
            AgeGp: d.age_group,
            Sex: d.sex,
            Race: d.race,
            Ethnicity: d.ethnicity,
            SymptomStat: d.symptom_status,
            Hosp: d.hosp_yn,
            ICU: d.icu_yn,
            Death: d.death_yn,
            Underlying: d.underlying_conditions_yn
        };
    }
    const covidMO = d3.csv(filePath, rowConverter);
    covidMO.then(function(data){
        //console.log(data)
        //excluding missing values
        dataMF = data.filter(function(d){return d.Sex === 'Male' ||
                                        d.Sex ==='Female'})
        
        //console.log(dataMF)
        var uniqueCounty = [...new Set(dataMF.map(d=>d.County))]
        //console.log('counties',uniqueCounty)
        var yearmonth = function(yearmonth){
            filter = dataMF.filter(function(d){return d.YearMonth ===yearmonth})
            //console.log(yearmonth,filter)
            var groups = d3.rollups(filter,d=>d.length,d=>d.County,d=>d.Sex)
            //console.log('groups',groups)
            var countyDict = {}
            var countyMF = []
            for (var i=0;i<groups.length;i++){
                groups[i]=groups[i].flat(2)
                //console.log(groups[i])
                var entry = [groups[i][0], 
                        (groups[i][1]==='Male') ? groups[i][2]:groups[i][4],
                        (groups[i][1]==='Female') ? groups[i][2]:groups[i][4]]
                //countyMF[groups[i][0]] = entry
                countyMF.push(entry)
                countyDict[groups[i][0]]=[(groups[i][1]==='Male') ? groups[i][2]:groups[i][4],
                (groups[i][1]==='Female') ? groups[i][2]:groups[i][4]]
            }
            for (var county in countyMF){
                var valueArr = countyMF[county]
                if (typeof valueArr[1]==="undefined") valueArr[1] = 0
                if (typeof valueArr[2]==='undefined') valueArr[2] = 0
            }
            var counties = Object.keys(countyDict)
            for (var county1 in uniqueCounty){
                
                var county = uniqueCounty[county1]
                //console.log(county)
                if (counties.includes(county)) continue
                else {
                    countyMF.push([county,0,0])
                }
                //else countyMF.push()
            }
            return countyMF
        }
        /*//computing global max
        var groups = d3.rollups(dataMF, d=> d.length,d=>d.YearMonth, d=>d.Sex)
        console.log(groups)
        var aggData = {}
        for (var i=0;i<groups.length;i++){
            groups[i]=groups[i].flat(2)
            var entry = [//groups[i][0], 
                        (groups[i][1]==='Male') ? groups[i][2]:groups[i][4],
                        (groups[i][1]==='Female') ? groups[i][2]:groups[i][4]]
            //console.log(entrys)
            aggData[groups[i][0]]=entry
            
        }
        console.log('agg',aggData) //yearmonth,male,female*/
        firstYearMonth = yearmonth('2020-03')
        //console.log(firstYearMonth)
        //setting up svg
        

        var svg = d3.select('#q1_plot')
            .append('svg')
            .attr('width',svgwidth)
            .attr('height',svgheight)
            .attr('class','scatter')

        //setting up scales for scatterplot
        var xScale = d3.scaleLinear() //Male axis
			.domain([0,d3.max(firstYearMonth,d=>d[1])+pad])
            //.domain([0, 5484+pad])
			.range([margin, w]).nice();

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(firstYearMonth,d=>d[2])+pad])
            //.domain([0, 7176+pad])
            .range([h, margin]).nice();

        var xAxis = d3.axisBottom(xScale)
        var yAxis = d3.axisLeft(yScale)

        svg.append('g').call(xAxis)
            .attr('class', 'xAxis')
            .attr('stroke','orange')
            .append('text')
            .attr('x',svgwidth/2)
            .attr('y',svgheight-pad)
            .attr('class','xAxis_label')
            .attr('stroke-width','1px')
            .text('Male COVID-19 cases by County')

        svg.append('g').call(yAxis)
            .attr('class','yAxis')
            .attr('stroke','orange')
            .append('text')
            .attr('x',-svgheight/2)
            .attr('y',-40)
            .attr('class','yAxis_label')
            .attr('stroke-width','1px')
            .text('Female COVID-19 cases by County');

        var Tooltip = d3.select('#q1_plot')
            .append('div')
            .style('opacity',0)
            .attr('class','tooltip')

        var points = svg.selectAll('circle')
            .data(firstYearMonth).enter().append('circle')
            .attr('cx',d=>xScale(d[1]))
            .attr('cy',d=>yScale(d[2]))
            .attr('r',3)
            .attr('fill','orange')
            .on('mouseover',(e,d)=>{
                Tooltip.transition().duration(50).style('opacity',0.9)
                Tooltip.html(d[0]+' County Cases: ('+d[1]+' male, '+d[2]+' female)')
                    .style('left',e.pageX+'px')
                    .style('top',e.pageY+'px')
            })
            .on('mousemove',(e,d)=>{
                Tooltip.transition().duration(50).style('opacity',0.9)
                Tooltip.html(d[0]+' County Cases: ('+d[1]+' male, '+d[2]+' female)')
                    .style('left',e.pageX+5+'px')
                    .style('top',e.pageY+5+'px')
            })
            .on('mouseout',(e,d)=>{
                Tooltip.transition().duration(500).style('opacity',0)
            })
        
        var line = d3.line()
        
        var pointsline = [[xScale(0),yScale(0)], [xScale(d3.max(firstYearMonth,d=>d[1])+pad),yScale(d3.max(firstYearMonth,d=>d[2])+pad)]]
        var pathOfLine = line(pointsline)
        svg.append('path')
            .attr('d',pathOfLine)
            .attr('stroke','black')
        
        document.getElementById("slider").innerHTML = 'Scatterplot of Number of COVID-19 Males vs. Females By Missouri County for March, 2020'
        var updateScatter = function(yearmonthData){
            //console.log(d3.max(yearmonthData,d=>d[1])+', '+d3.max(yearmonthData,d=>d[2]))
            svg.selectAll('g').remove()
            var xScale = d3.scaleLinear() //Male axis
                .domain([0,d3.max(yearmonthData,d=>d[1])+pad])
            //    .domain([0, 5484+pad])
                .rangeRound([margin, w]);

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(yearmonthData,d=>d[2])+pad])
            //    .domain([0, 7176+pad])
                .rangeRound([h, margin]);

            var xAxis = d3.axisBottom(xScale)
            var yAxis = d3.axisLeft(yScale)

            svg.selectAll('circle')
                .data(yearmonthData)
                .attr('cx',d=>xScale(d[1]))
                .attr('cy',d=>yScale(d[2]))

            svg.append('g').call(xAxis)
                .attr('class', 'xAxis')
                .attr('stroke','orange')
                .append('text')
                .attr('x',svgwidth/2)
                .attr('y',svgheight-pad)
                .attr('class','xAxis_label')
                .attr('stroke-width','1px')
                .text('Male COVID-19 cases by County');
    
            svg.append('g').call(yAxis)
                .attr('class','yAxis')
                .attr('stroke','orange')
                .append('text')
                .attr('x',-svgheight/2)
                .attr('y',-40)
                .attr('class','yAxis_label')
                .attr('stroke-width','1px')
                .text('Female COVID-19 cases by County');
                
        }
        // Listen to the slider?
        d3.select("#mySlider").on("change", function(d){
            selectedValue = this.value
            var slider2data = {
                1:'2020-03',
                2:'2020-04',
                3:'2020-05',
                4:'2020-06',
                5:'2020-07',
                6:'2020-08',
                7:'2020-09',
                8:'2020-10',
                9:'2020-11',
                10:'2020-12',
                11:'2021-01',
                12:'2021-02',
                13:'2021-03',
                14:'2021-04',
                15:'2021-05',
                16:'2021-06',
                17:'2021-07',
                18:'2021-08',
                19:'2021-09',
                20:'2021-10',
                21:'2021-11',
                22:'2021-12',
                23:'2022-01',
                24:'2022-02'
            }
            //console.log(selectedValue,slider2data[selectedValue])
            newdata =yearmonth(slider2data[selectedValue])
            updateScatter(newdata)
            monthDict = {
                '01':'January',
                '02':'February',
                '03':'March',
                '04':'April',
                '05':'May',
                '06':'June',
                '07':'July',
                '08':'August',
                '09':'September',
                '10':'October',
                '11':'November',
                '12':'December'
            }
            document.getElementById("slider").innerHTML = 'Scatterplot of Number of COVID-19 Positive Males vs. Females By Missouri County for '+monthDict[slider2data[selectedValue].substring(5)]+', '+slider2data[selectedValue].substring(0,4)
        })
        document.getElementById('q1_color').innerHTML ='Color Scheme: I used a blue, low-saturated, color for the background and highly-saturated orange points to represent each point and axes for the scatterplot. Therefore, there is high contrast between the 2 which allows it to be easily seen. I used a light blue color for the slider on a gray background, so it seems more intuitive to slide the blue point across the background of the slider.'
        document.getElementById('q1_mc').innerHTML = 'Marks: Points representing each county, Line representing the expected 1:1 relationship between the 2 axes, point representing the month. <br> Channels: both horizontal and vertical positioning. horizontal positioning for the slider'
    })
}

//add title
//explain color scheme
//explain marks and channels
var question2=function(filePath){
    var rowConverter = function(d){
        return {
            YearMonth: d.case_month,
            Year: parseInt(d.year),
            Month: parseInt(d.month),
            County: d.res_county,
            CountyFips: parseInt(d.county_fips_code),
            AgeGp: d.age_group,
            Sex: d.sex,
            Race: d.race,
            Ethnicity: d.ethnicity,
            SymptomStat: d.symptom_status,
            Hosp: d.hosp_yn,
            ICU: d.icu_yn,
            Death: d.death_yn,
            Underlying: d.underlying_conditions_yn
        };
    }
    const covidMO = d3.csv(filePath, rowConverter);
    covidMO.then(function(data){
        //console.log(data)
        data.forEach(d=>{
            d.YearMonth = d3.timeParse("%Y-%m")(d.YearMonth)
        })
        //console.log(data)
        var groups = d3.rollups(data, d => d.length,d=>d.YearMonth)
        //console.log(groups)
        
        var svg = d3.select('#q2_plot')
            .append('svg')
            .attr('width',svgwidth)
            .attr('height',svgheight)
            .attr('class','linechart')
        var xScale = d3.scaleTime().domain([new Date('2020-01'),new Date('2022-02')]).range([margin,w])
        var yScale = d3.scaleLinear().domain([0,d3.max(groups,d=>d[1])+30]).range([h,margin]).nice()
        var xAxis = d3.axisBottom(xScale).ticks(groups.length+2)
        var yAxis = d3.axisLeft(yScale)

        svg.append('g')
            .attr('class', 'xAxis')
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
        svg.append('text')
            .attr('x',svgwidth/2)
            .attr('y',svgheight-pad)
            //.attr('class','xAxis_label')
            .attr('stroke','black')
            .text('Month')
            .attr('font-size','11px');
        
        svg.append('g').call(yAxis)
            .attr('class','yAxis')
            .append('text')
            .attr('x',-svgheight/2)
            .attr('y',-50)
            .attr('class','yAxis_label')
            .text('Number of COVID-19 Positive Cases')
            .attr('stroke','black');

        var points = svg.selectAll('circle')
            .data(groups).enter().append('circle')
            .attr('cx',d=>xScale(d[0]))
            .attr('cy',d=>yScale(d[1]))
            .attr('r',3)
        
        function sortbyDate(a,b){return a[0]-b[0]}
        groups=groups.sort(sortbyDate)
        //console.log(groups)
        connections = groups.map(d=>[xScale(d[0]),yScale(d[1])])
        var line = d3.line()
        svg.append('g')
            .selectAll('path')
            .data(connections)
            .enter()
            .append('path')
            .attr('d',line(connections))
            .attr('class','trendLines')
        document.getElementById('q2_title').innerHTML ='Line Plot of Total Number of COVID-19 Cases in Missouri Over Time'
        document.getElementById('q2_color').innerHTML ='Color Scheme: For the lines I used a highly saturated pink because I wanted it to pop out to the viewer.'
        document.getElementById('q2_mc').innerHTML = 'Marks: points and lines <br> Channels: vertical/horizontal positioning for both'    
    })
}

//add title
//explain color scheme
//explain marks and channels
var question3=function(filePath){
    var rowConverter = function(d){
        return {
            YearMonth: d.case_month,
            Year: parseInt(d.year),
            Month: parseInt(d.month),
            County: d.res_county,
            CountyFips: parseInt(d.county_fips_code),
            AgeGp: d.age_group,
            Sex: d.sex,
            Race: d.race,
            Ethnicity: d.ethnicity,
            SymptomStat: d.symptom_status,
            Hosp: d.hosp_yn,
            ICU: d.icu_yn,
            Death: d.death_yn,
            Underlying: d.underlying_conditions_yn
        };
    }
    const covidMO = d3.csv(filePath, rowConverter);
    covidMO.then(function(data){
        dataAge = d3.filter(data,d=>d.AgeGp!='' & d.AgeGp!='Missing')
        dataAge.forEach(d=>{
            d.YearMonth = d3.timeParse("%Y-%m")(d.YearMonth)
        })
        //console.log(dataAge)

        var uniqueAge = [...new Set(dataAge.map(d=>d.AgeGp))]
        var monthsSorted = Array.from(d3.group(dataAge,d=>d.YearMonth).keys()).sort((a,b)=>a-b)
        //console.log(uniqueAge)
        //console.log(monthsSorted)
        var groups = d3.rollups(dataAge, d => d.length,d=>d.YearMonth,d=>d.AgeGp)
        //console.log(groups)

        res = []
        for (i=0;i<groups.length;i++){
            dict = {}
            dict['YearMonth']=groups[i][0]
            groups[i][1] = groups[i][1].sort()
            //console.log(groups[i][1])
            if (groups[i][1][0][0]!='0 - 17 years'){
                dict['0 - 17 years'] = 0
                dict['18 - 49 years'] = groups[i][1][0][1]
                dict['50 - 64 years'] = groups[i][1][1][1]
                dict['65+ years'] = groups[i][1][2][1]
                res.push(dict)
                continue
            }
            dict['0 - 17 years'] = groups[i][1][0][1]
            dict['18 - 49 years'] = groups[i][1][1][1]
            dict['50 - 64 years'] = groups[i][1][2][1]
            dict['65+ years'] = groups[i][1][3][1]
            res.push(dict)
        }
        res = res.sort((a,b)=>a.YearMonth-b.YearMonth)
        //console.log(res)

        //used this link for inspiration, but had to make some major changes to get the code to work: https://www.d3-graph-gallery.com/graph/stackedarea_template.html
        var svg = d3.select('#q3_plot')
            .append('svg')
            .attr('width',svgwidth)
            .attr('height',svgheight)
            .attr('class','streamgraph')
        
        var xScale = d3.scaleTime().domain(d3.extent(dataAge,d=>d.YearMonth)).range([margin,w])
        var yScale = d3.scaleLinear().domain([0,d3.max(res,d=>d['0 - 17 years']+d['18 - 49 years']+d['50 - 64 years']+d['65+ years'])+30]).range([h,margin])
        var xAxis = d3.axisBottom(xScale).ticks(monthsSorted.length)
        var yAxis = d3.axisLeft(yScale)
        
        svg.append('g')
            .attr('class', 'xAxis')
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
        svg.append('text')
            .attr('x',svgwidth/2)
            .attr('y',svgheight-pad)
            //.attr('class','xAxis_label')
            .attr('stroke','black')
            .text('Month')
            .attr('font-size','11px');
        svg.append('g').call(yAxis)
            .attr('class','yAxis')
            .append('text')
            .attr('x',-svgheight/2)
            .attr('y',-50)
            .attr('class','yAxis_label')
            .text('Number of COVID-19 Positive Cases')
            .attr('stroke','black');
        
        var types = ['0 - 17 years','18 - 49 years','50 - 64 years','65+ years']
        //red-purple, yellow-orange, yellow-green, blue-purple,
        var color = d3.scaleOrdinal().domain(types).range(['hsl(35,80%,51%)','hsl(328,80%,45%)','hsl(115,80%,50%)','hsl(255,53%,38%)'])
        var stack = d3.stack().keys(types)(res)
        //console.log(stack)
        /*svg.selectAll('layers').data(stack).enter().append('path').attr('fill',d=>color(d.key))
            .attr('d',d3.area()
                .x(d=>xScale(d.data.YearMonth))
                .y0(d=>yScale(d[0]))
                .y1(d=>yScale(d[1])))*/
        svg.selectAll('rects')
            .data(types).enter().append('rect')
            .attr('x',w-margin-100)
            .attr('y',(d,i)=>10+i*(25))
            .attr('width',20)
            .attr('height',20)
            .attr('fill',d=>color(d))
        svg.selectAll('labels')
            .data(types).enter().append('text')
            .attr('x',w-margin-70)
            .attr('y',(d,i)=>10+i*(25)+10)
            .attr('fill',d=>color(d))
            .text((d,i)=>types[i])
            .attr('class','leglabels')

        // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", w-margin)
            .attr("height", h)
            .attr("x", margin)
            .attr("y", margin);

        // Add brushing
        var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
            .extent([[margin,margin], [w,h]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

        // Create the scatter variable: where both the circles and the brush take place
        var areaChart = svg.append('g')
            .attr("clip-path", "url(#clip)")

        // Area generator
        var area = d3.area()
            .x(d=>xScale(d.data.YearMonth))
            .y0(d=>yScale(d[0]))
            .y1(d=>yScale(d[1]))

        // Show the areas
        areaChart
            .selectAll("mylayers")
            .data(stack)
            .enter()
            .append("path")
                .attr('fill',d=>color(d.key))
                .attr("class", d=>"myArea " + d.key)
                .attr("d", area)

        // Add the brushing
        areaChart
            .append("g")
            .attr("class", "brush")
            .call(brush);

        var idleTimeout
        function idled() { idleTimeout = null; }

        // A function that update the chart for given boundaries
        function updateChart({selection}) {

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if(selection===null){
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                xScale.domain(d3.extent(dataAge,d=>d.YearMonth)).range([margin,w])
            }else{
                xScale.domain([xScale.invert(selection[0]), xScale.invert(selection[1])]).range([margin,w])
                areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and area position
            svg.select('g.xAxis').remove()
            //.transition().duration(1000).call(d3.axisBottom(xScale).ticks(11))
            svg.append('g')
                .attr('class', 'xAxis')
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");
            svg.append('text')
                .attr('x',svgwidth/2)
                .attr('y',svgheight-pad)
                //.attr('class','xAxis_label')
                .attr('stroke','black')
                .text('Month')
                .attr('font-size','11px');
            areaChart
                .selectAll("path")
                .transition().duration(1000)
                .attr("d", area)
        }
        document.getElementById('q3_title').innerHTML ='Stacked Area Chart (Streamgraph) of Total Number of COVID-19 Cases in Missouri Over Time for Different Age Groups. '
        document.getElementById('q3_color').innerHTML ='Color Scheme: I used 4 different colors to represent the age groups; all of which were low-saturated because they take up large areas. In addition, I made sure that the different colors could be distinguished next to one another. Lastly, I used more reddish hues to represent younger age groups, and bluish hues to represent older age groups in a sequential manner. Lastly, I steered clear from red and green because of color blindness.'
        document.getElementById('q3_mc').innerHTML = 'Marks: areas which represent the different age groups <br> Channels: the vertical/horizontal positioning of the edges of each area representing the monthly value of COVID cases, the color of the area representing the age group, the size of the area showing the value for a particular group during a particular month.'   
    })
}

//counties: Greene, Jackson, Jefferson, Boone, Clay
//add title
//explain color scheme
//explain marks and channels
var question4=function(filePath){
    var rowConverter = function(d){
        return {
            YearMonth: d.case_month,
            Year: parseInt(d.year),
            Month: parseInt(d.month),
            County: d.res_county,
            CountyFips: parseInt(d.county_fips_code),
            AgeGp: d.age_group,
            Sex: d.sex,
            Race: d.race,
            Ethnicity: d.ethnicity,
            SymptomStat: d.symptom_status,
            Hosp: d.hosp_yn,
            ICU: d.icu_yn,
            Death: d.death_yn,
            Underlying: d.underlying_conditions_yn
        };
    }
    const covidMO = d3.csv(filePath, rowConverter);
    covidMO.then(function(data){
        dataCounty = d3.filter(data,d=>d.County==='GREENE'|
                                    d.County==='JACKSON'|
                                    d.County==='JEFFERSON'|
                                    d.County==='BOONE'|
                                    d.County==='CLAY')
        //console.log(dataCounty)
        
        dataCounty.forEach(d=>{
            if (d.Race ==='') d.Race = 'Unknown'
            if (d.Race ==='Missing') d.Race = 'Unknown'
            if (d.Race==='American Indian/Alaska Native') d.Race = 'Multiple/Other'
        })
        var county = Array.from(d3.groups(dataCounty,d=>d.County))
        counties = d3.map(county,d=>d[0])
        var race = Array.from(d3.groups(dataCounty,d=>d.Race))
        races = d3.map(race,d=>d[0])
        //console.log(races)
        //console.log(race)

        groupby = d3.rollups(dataCounty,d=>d.length,d=>d.County,d=>d.Race)
        dataNew = []
        for (var i=0;i<groupby.length;i++){
            //console.log(groupby[i])
            groupby[i][1]=groupby[i][1].sort()
            //console.log(groupby[i])
            dataNew.push({'County':groupby[i][0],
                        'Asian':groupby[i][1][0][1],
                        'Black':groupby[i][1][1][1],
                        'Multiple/Other':groupby[i][1][2][1],
                        'Unknown':groupby[i][1][3][1],
                        'White':groupby[i][1][4][1]})
        }
        //console.log(dataNew)
        var stack = d3.stack().keys(races)(dataNew)
        
        //console.log(stack)
        var colors = d3.scaleOrdinal().domain(races).range(['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f'])
        //console.log(groupby)
        var svg = d3.select('#q4_plot')
            .append('svg')
            .attr('width',svgwidth)
            .attr('height',svgheight+100)
            .attr('class','stacked')

        var xScale = d3.scaleBand().domain(counties).range([margin,w]).paddingInner(0.05).paddingOuter(0.1);
        var yScale = d3.scaleLinear().domain([0,d3.max(dataNew,d=>d.Asian+d.Black+d['Multiple/Other']+d.Unknown+d.White)]).range([h+100,margin+100]).nice()
        var xAxis = d3.axisBottom(xScale)
        var yAxis = d3.axisLeft(yScale)
        svg.append('g')
            .call(xAxis)
            //.attr('class', 'xAxis')
            .attr('transform','translate(0 640)')
            .append('text')
            .attr('x',svgwidth/2)
            .attr('y',svgheight-pad)
            .attr('class','xAxis_label')
            .text('County')
            .attr('stroke','black');
        svg.append('g').call(yAxis)
            .attr('class','yAxis')
            .append('text')
            .attr('x',-(svgheight+100)/2)
            .attr('y',-50)
            .attr('class','yAxis_label')
            .text('Number of Positive COVID-19 Cases')
            .attr('stroke','black');
        
        var groups = svg.selectAll('.gbars')
            .data(stack).enter().append('g')
            .attr('class','gbars')
            .attr('fill',(d,i)=>colors(d.key))
        var rects = groups.selectAll('rect')
            .data(d=>d).enter().append('rect')
            .attr('x',d=>xScale(d.data.County))
            .attr('y',d=>yScale(d[1]))
            .attr('width',d=>xScale.bandwidth())
            .attr('height',d=>yScale(d[0])-yScale(d[1]))
            .attr('class','bar')

        svg.selectAll('rects')
            .data(races).enter().append('rect')
            .attr('x',w-margin-100)
            .attr('y',(d,i)=>10+i*(25))
            .attr('width',20)
            .attr('height',20)
            .attr('fill',d=>colors(d))
        svg.selectAll('labels')
            .data(races).enter().append('text')
            .attr('x',w-margin-70)
            .attr('y',(d,i)=>10+i*(25)+10)
            .attr('fill',d=>colors(d))
            .text((d,i)=>races[i])
            .attr('class','leglabels')
        var updateGraph1 = function(){
            //console.log(dataNew)
            svg.select('g.yAxis').remove()
            var xScale = d3.scaleBand().domain(counties).range([margin,w]).paddingInner(0.05).paddingOuter(0.1);
            var yScale = d3.scaleLinear().domain([0,d3.max(dataNew,d=>d.Asian+d.Black+d['Multiple/Other']+d.Unknown+d.White)]).range([h+100,margin+100]).nice()
            var xAxis = d3.axisBottom(xScale)
            var yAxis = d3.axisLeft(yScale)
            svg.append('g')
                .call(xAxis)
                //.attr('class', 'xAxis')
                .attr('transform','translate(0 640)')
                .append('text')
                .attr('x',svgwidth/2)
                .attr('y',svgheight-pad)
                .attr('class','xAxis_label')
                .text('County')
                .attr('stroke','black');
            svg.append('g').call(yAxis)
                .attr('class','yAxis')
                .append('text')
                .attr('x',-(svgheight+100)/2)
                .attr('y',-50)
                .attr('class','yAxis_label')
                .text('Number of Positive COVID-19 Cases')
                .attr('stroke','black');
            
            var groups = svg.selectAll('.gbars')
                .data(stack)
                .attr('class','gbars')
                .attr('fill',(d,i)=>colors(d.key))
            var rects = groups.selectAll('rect')
                .data(d=>d)
                .attr('x',d=>xScale(d.data.County))
                .attr('y',d=>yScale(d[1]))
                .attr('width',d=>xScale.bandwidth())
                .attr('height',d=>yScale(d[0])-yScale(d[1]))
                .attr('class','bar')

            svg.selectAll('rects')
                .data(races).enter().append('rect')
                .attr('x',w-margin-100)
                .attr('y',(d,i)=>10+i*(25))
                .attr('width',20)
                .attr('height',20)
                .attr('fill',d=>colors(d))
            svg.selectAll('labels')
                .data(races).enter().append('text')
                .attr('x',w-margin-70)
                .attr('y',(d,i)=>10+i*(25)+10)
                .attr('fill',d=>colors(d))
                .text((d,i)=>races[i])
                .attr('class','leglabels')
        }
        
        var updateGraph2 = function(){
            //console.log('hi')
            svg.select('g.yAxis').remove()
            yScale = d3.scaleLinear().domain([0,100]).range([h+100,margin+100]).nice()
            svg.append('g').call(d3.axisLeft(yScale))
                .attr('class','yAxis')
                .append('text')
                .attr('x',-(svgheight+100)/2)
                .attr('y',-50)
                .attr('class','yAxis_label')
                .text('Percentage of Positive COVID-19 Cases')
                .attr('stroke','black');
            
            dataNormalized = JSON.parse(JSON.stringify(dataNew))
            dataNormalized.forEach(function(d){
                var total = 0
                for (i in races){
                    var race = races[i]
                    total += +d[race]
                }
                for (i in races){
                    var race = races[i]
                    d[race]=d[race]/total*100
                }
            })
            //console.log(dataNormalized)
            newStack = d3.stack().keys(races)(dataNormalized)
            //svg.selectAll('gbars.bar').remove()
            svg.selectAll('.gbars')
                .data(newStack)
                .attr('class','gbars')
                .attr('fill',(d,i)=>colors(d.key))
            groups.selectAll('rect')
                .data(d=>d)//.enter().append('rect')
                //.attr('x',d=>xScale(d.data.County))
                .attr('y',d=>yScale(d[1]))
                .attr('width',d=>xScale.bandwidth())
                .attr('height',d=>yScale(d[0])-yScale(d[1]))
                .attr('class','normbar')
        }

        d3.select('#q4_norm')
            .on('click',updateGraph2)
        d3.select('#q4_freq')
            .on('click',updateGraph1)

        document.getElementById('q4_title').innerHTML ='Stacked Bar Chart of Number of COVID-19 Cases in 5 Missouri Counties (with most COVID cases) By Race'
        document.getElementById('q4_color').innerHTML ='Color Scheme: For the areas I chose colors that were colorblind friendly and could be distinguished next to one another. There is no inherent ordering of the races, so I did not choose a particular ordering for the colors. I used low-saturated colors so they would not be an eye sore.'
        document.getElementById('q4_mc').innerHTML = 'Marks: areas <br> Channels: vertical/horizontal positioning for both, height, color'      
    })
}

//explain color scheme
//explain marks and channels
var question5=function(filePath){
    var rowConverter = function(d){
        return {
            YearMonth: d.case_month,
            Year: parseInt(d.year),
            Month: parseInt(d.month),
            County: d.res_county,
            CountyFips: parseInt(d.county_fips_code),
            AgeGp: d.age_group,
            Sex: d.sex,
            Race: d.race,
            Ethnicity: d.ethnicity,
            SymptomStat: d.symptom_status,
            Hosp: d.hosp_yn,
            ICU: d.icu_yn,
            Death: d.death_yn,
            Underlying: d.underlying_conditions_yn
        };
    }
    const covidMO = d3.csv(filePath, rowConverter);
    covidMO.then(function(data){
        var yearmonth = Array.from(d3.flatRollup(data,d=>d.length,d=>d.YearMonth,d=>d.Year,d=>d.Month))
        yearmonths = d3.map(yearmonth,d=>d[0])
        //console.log(yearmonth)

        dataYear = []
        for (var i=0;i<yearmonth.length;i++){
            //console.log(yearmonth[i])
            dataYear.push({
                'Year': yearmonth[i][1],
                'Month': yearmonth[i][2],
                'Count': yearmonth[i][3]
            })
        }
        
        dataYear =dataYear.sort((a,b)=>a.Year-b.Year)
        console.log(dataYear)

        var yearsGrouped = d3.groups(dataYear, d=>d.Year)
        //console.log(yearsGrouped)

        yearStats = []
        for (var i=0;i<yearsGrouped.length;i++){
            q1 = d3.quantile(yearsGrouped[i][1].map(d=>d.Count).sort(d3.ascending),.25)
            //console.log(q1)
            median = d3.quantile(yearsGrouped[i][1].map(d=>d.Count).sort(d3.ascending),.5)
            q3 = d3.quantile(yearsGrouped[i][1].map(d=>d.Count).sort(d3.ascending),.75)
            iqr = q3-q1
            min = d3.min(yearsGrouped[i][1].map(d=>d.Count))
            max = q3 + 1.5 * iqr
            yearStats.push({
                'year':yearsGrouped[i][0],
                'min':min,
                'q1':q1,
                'median':median,
                'q3':q3,
                'max':max,
                'iqr':iqr
            })
        }
        console.log(yearStats)

        var svg = d3.select('#q5_plot')
            .append('svg')
            .attr('width',svgwidth)
            .attr('height',svgheight)
            .attr('class','boxplot')

        var xScale = d3.scaleBand().domain([2020,2021,2022]).range([margin,w]).paddingInner(0.1).paddingOuter(0.1)
        var yScale = d3.scaleLinear().domain([0,d3.max(yearStats,d=>d.max)]).range([h,margin])
        var xAxis = d3.axisBottom()
            .scale(xScale)
        
        var yAxis = d3.axisLeft()
            .scale(yScale)
        
        svg.append('g')
            .call(xAxis)
            .attr('class', 'xAxis')
            .append('text')
            .attr('x',svgwidth/2)
            .attr('y',svgheight-pad)
            .attr('class','xAxis_label')
            .text('Year')
            .attr('stroke','black');

        svg.append('g')
            .call(yAxis)
            .attr('class','yAxis')
            .append('text')
            .attr('x',-svgheight/2)
            .attr('y',-50)
            .attr('class','yAxis_label')
            .text('Monthly Count of Positive COVID-19 Individuals')
            .attr('stroke','black');

        svg.selectAll('verticalLines')
            .data(yearStats).enter().append('line')
            .attr('x1',d=>xScale(d.year)+xScale.bandwidth()/2)
            .attr('x2',d=>xScale(d.year)+xScale.bandwidth()/2)
            .attr('y1',d=>h)
            .attr('y2',d=>yScale(d.max))
            .attr('stroke','black')
            .style('width',40)
        
        svg.selectAll('box')
            .data(yearStats).enter().append('rect')
            .attr('x',d=>xScale(d.year))
            .attr('y',d=>yScale(d.q3))
            .attr('width',xScale.bandwidth())
            .attr('height',d=>yScale(d.q1)-yScale(d.q3))
            .attr('stroke','black')
            .attr('fill','#8dd3c7')

        svg.selectAll('medLines')
            .data(yearStats).enter().append('line')
            .attr('x1',d=>xScale(d.year))
            .attr('x2',d=>xScale(d.year)+xScale.bandwidth())
            .attr('y1',d=>yScale(d.median))
            .attr('y2',d=>yScale(d.median))
            .attr('stroke','black')
            .style('width',40)
        
        svg.selectAll('circle')
            .data(dataYear).enter().append('circle')
            .attr("cx", d=>xScale(d.Year) +xScale.bandwidth()/2- xScale.bandwidth()/4 + Math.random()*xScale.bandwidth()/2)
            .attr("cy", d=>yScale(d.Count))
            .attr("r", 3)
            .style("fill", "blue")
            .attr("stroke", "black")

        document.getElementById('q5_title').innerHTML ='Boxplot for Distribution of Number of COVID-19 Cases in Missouri by Year'
        document.getElementById('q5_color').innerHTML ='Color Scheme: For the boxplot areas, I chose a low-saturated teal so it was not an eye sore. For the individual points I used a saturated blue color because I wanted them to stand out.'
        document.getElementById('q5_mc').innerHTML = 'Marks: points (the underlying data for the boxplots), areas (Q1-Q3), lines (median line, 1.5*IQR) <br> Channels: vertical/horizontal positioning for both, height, color'          
    })
}
