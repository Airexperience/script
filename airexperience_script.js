const au = "http://tunnel.airexperience.dk"
const aa = au+"/admin/"
const am = aa+"?module="

if(location.href.indexOf(aa+'?module=flightVideos') > -1){
  flightVideosUICAE()

  jQuery(document).ajaxSuccess(function(event, xhr, settings) {
  console.log("Data refreshed")
            setTimeout(flightVideosUICAE, 200);
  });
}

function flightVideosUICAE(){
  console.log("UI updated")
  $('.module-flightVideos').click((e) => {
        console.log(e.target, e.target.parentElement)
        if(e.target.parentElement.href != null && e.target.parentElement.href.indexOf('/video/') > 0){
            e.target.parentElement.parentElement.parentElement.style.backgroundColor = '#99ff99'
        }
    })

    var flights = Array.from(document.querySelectorAll('.module-flightVideos tr')).map(item => item.querySelectorAll('td')).filter(item => item.length > 0 && item[8].querySelectorAll('a').length > 0);
    if (flights.length > 0) {
        flights.forEach(video => {

            // Specific person search
            if(location.href.indexOf(am+'flightVideos&do=all&search=') > -1 && location.search.split("&").find(item => item.indexOf('search')>-1).split("=")[1].length > 0){
                date = video[7].innerText.split(" ")[0].replace(/-/gi,"")
                session = video[1].innerText
                instructor = video[9].innerText.trim()
                flyer = video[0].textContent.trim().split(' (')[0]
                withInstructor = instructor == flyer ? "" : ` with ${instructor}`
                name = `${date} - ${flyer}${withInstructor} -  ${session}`;
            }
            else {
                name =  video[0].textContent.trim().split(' (')[0];    
            }

            link = video[8].children[0];
            link.download = name.replace(/\./gi,"");

            if(video[3].innerHTML == "-"){
              linkVideo = video[2].children[0];
              videoIDCAE = new URL(linkVideo ).search.split("&").filter(i=>i.indexOf("id=")>-1)[0].replace("id=","")
              video[3].innerHTML = '<span style="custor:pointer;" id="videoIDCAE'+videoIDCAE+'" onclick="sellVideoCAE('+videoIDCAE+')">Sell</span>'
            }
        })    
    }
}

if(location.href.indexOf(am+'reception') > -1){
  
    try{
    const tt = new WebSocket('wss://ntfy.sh/jgghwhegellg/ws');
    tt.addEventListener('message', function (event) {
    console.log(event.data);
    data = JSON.parse(event.data)
    if(data.message != null && data.message.length<10){
      jQuery('.timeTunnel').html(data.message)
    }
  });
  } catch(e) {
    console.log(e)
  }

  jQuery(".clock").after(`<div class="timeTunnelWrapper" style="width: 100px; position: absolute; top: 5px; left: 105px; color: white; text-align: center;"><div class="timeTunnel" style="font-size: 2.1em;" > </div></div>`)
}

if(location.href.indexOf(am+'reception&do=reservations') > -1){
  
    setInterval(function(){ document.querySelector('.noteField textarea[rows="5"]').rows=30;}, 500);
  
    $('[name=email]').live("focus", (e)=>{
    e.target.value = e.target.value=="" ? generateEmail() : e.target.value
    e.target.select()
    })
    
    function generateEmail(){
        return `${$('[name=firstName]')[0].value.toLowerCase().replace(/ /gi,".")}.${$('[name=lastName]')[0].value.toLowerCase().replace(/ /gi,".")}@sletmig.dk`.replace(/æ|ø|å/gi,"")
    }
    
    $('.trigger').live('click', () => setTimeout(()=>{
        $('.module-customers form.edit .section').each((i,e) => {
            if(i==1 || i==2) $(e).hide()
        
            if(i==0){
                $($(e).children()[0]).hide()
                const emailChange = `<div class="field " align="center">${
                [
                "icloud.com",
                "gmail.com",
                "hotmail.com",
                "yahoo.com",
                "yahoo.dk",
                "mail.dk"
                ].map(i=>`<a class="changeEmail" href="#">@${i}</a>`)}</div>`
                $($(e).children()[3]).after(emailChange)
                 $('.changeEmail').live('click', (e) => {
                   
                  $('[name=email]')[0].value = $('[name=email]')[0].value.indexOf("@")>-1?$('[name=email]')[0].value.replace(/@.*/gi, e.currentTarget.innerText):$('[name=email]')[0].value+e.currentTarget.innerText
                 })
            }
        
            if(i==3){
              fc = (c) => $($(e).children()[c]) 
                fc(0).hide()
                fc(1).hide()
                fc(4).hide()
                fc(2).css('font-size',16)
                fc(3).css('font-size',16)
            }
        })
    },200))

    ////////////////////////////////
    // Personer er mødt frem kode://
    ////////////////////////////////


    // Dynamisk tilføjelse af tjekboks
    jQuery(".costWrap").before(`<input type="checkbox" class="reservationCheckbox" style="
        position: absolute;
        margin-left: -24px;
        margin-top: 12px;
        transform: scale(1.5);
    ">`);
    console.log("Checkbox added:", jQuery(".reservationCheckbox"));

    // Hent gemt status fra localStorage og anvend det
    const savedChecked = JSON.parse(localStorage.getItem('checkedBoxes')) || {};

    jQuery(".reservationCheckbox").each((index, checkbox) => {
        // Hent data-hour for hver tidsblok, hvis det eksisterer
        const selectedHourElement = jQuery(".item.hour.open.selected");
        const dataHour = selectedHourElement.attr("data-hour"); // Brug attr i stedet for data

        if (savedChecked[dataHour]?.[index]) {
            checkbox.checked = true;
        }
    });

    // Håndtering af ændringer
    jQuery(".reservationCheckbox").change(function () {
        const checkedBoxes = {};

        // Tjek det valgte data-hour
        const selectedHourElement = jQuery(".item.hour.open.selected");
        const dataHour = selectedHourElement.attr("data-hour"); // Brug attr i stedet for data

        // Initialiser et tomt array for den valgte time, hvis det ikke findes
        if (!checkedBoxes[dataHour]) {
            checkedBoxes[dataHour] = {};
        }

        // Gem status for alle tjekbokse under det valgte timevindue
        jQuery(".reservationCheckbox").each((index, checkbox) => {
            checkedBoxes[dataHour][index] = checkbox.checked;


        });

        // Gem strukturen i localStorage
        localStorage.setItem('checkedBoxes', JSON.stringify(checkedBoxes));
        console.log("Saved to localStorage:", checkedBoxes);

    ////////////////////////////////
    // Antal reservationer//
    ////////////////////////////////
  
    // Find listen med reservationer
    const $reservationList = jQuery('.block.list.reservations');
    
    // Hvis listen findes
    if ($reservationList.length > 0) {
        const reservationCount = $reservationList.find('li').length;
    
        // Tilføj et inputfelt før reservation listen
        $reservationList.before(`
            <div class="reservationCountBox" style="
                margin-bottom: 10px;
                font-size: 18px;
                font-weight: bold;
            ">
                Antal reservationer: ${reservationCount}
            </div>
        `);
    
        console.log('Antal reservationer:', reservationCount);
    }
}

if(location.href.indexOf(am+'businessHours') > -1){
    setInterval(()=>{
        dialog = document.querySelectorAll('.calendarDialog[style*=display\\:\\ block] .closeHour')[0]
        if(dialog)dialog.click()
    },50)
}

function sellVideoCAE(videoID){
  console.log(videoID)

  jQuery.ajax({
      url: aa+"?" + jQuery.param({
          "module": "reception",
          "do": "sellVideo",
          "interval": "allTime",
          "json": "1",
          "ajax": "1",
      }),
      type: "POST",
      headers: {
          "Connection": "keep-alive",
          "Accept": "application/json, text/javascript, */*",
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": au,
          "Referer": am+"reception&do=videos&interval=allTime",
          "Accept-Language": "da,en-US;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip",
      },
      contentType: "application/x-www-form-urlencoded",
      data: {
          "id": ""+videoID,
      },
      success: function( response ){
        jQuery("#videoIDCAE"+videoID).parent().html('<img src="images/icons/tick.png" alt="">')
      }
  })
}



////////////////////////////////
// Operatør                   //
////////////////////////////////

if(location.href.includes('/?module=operator')){

  var errorWhenSending = false;
    
  setTimeout(function(){
    if(document.querySelectorAll('.hasFlyer.selected')[0]==undefined && document.querySelectorAll('.hasFlyer')[0]!=undefined){
     document.querySelectorAll('.hasFlyer')[0].click()
    }
  },300)
  
  document.addEventListener("keyup",function(e){
    // window.e=e
    const isDialog = e.target == document.querySelector("div.textMessageDialog input")
    
    // text dialog is open, ignore normal shortcuts
    if(isDialog){
    	if(e.key == "Escape"){
    		document.querySelector('[data-action="cancel"]').click()
    	}
    
    	if(e.key == "Enter"){
    		document.querySelector('[data-action="send"]').click()
    	}
    }
    else{
    	if(e.key == "i" || e.key == "ArrowRight"){
    		document.querySelector('.command-in button').click()
    	}
    	if(e.key == "o" || e.key == "u" || e.key == "ArrowLeft"){
    		document.querySelector('.command-out button').click()
    	}
    	
    	if(e.key == "d"){
    		document.querySelector('.command-toggleDemo button').click()
    	}
    
    
    	if(e.key == "l"){
    		document.querySelector('.preset2').click()
    	}
    	
    		if(e.key == "x"){
    		document.querySelector('.preset1').click()
    	}
    
    	if(e.key == "t"){
    		document.querySelector('.messageBtn.text[data-type="text"]').click()
    		//setTimeout(function(){document.querySelector("div.textMessageDialog input")},300)
    	}
    
    }
  })
  
  
  if (document.querySelector('#timeLeft') == null) {
    var timeLeftInterval = 0;
    $('body').append(`<div id="timeLeft" style="
      position: fixed;
      bottom: 0;
      left: 0;
      margin: 30px;
  "><span style="
      font-size: 30px;
      ">00 minutes</span></div>`);
  
  
  
    var timeLeft = 0;
    var lastSentTime = 0;
    var intervalIndex = 0;
  
    timeLeftInterval = setInterval(() => {
      
      intervalIndex++;
  
      timeLeft = Math.round(Array.from(document.querySelectorAll('.hasFlyer'))
        .map(item => item.getAttribute('data-flighttime'))
        .reduce((sum, next) => {
          return +sum + (+next > 0 ? +next : 0);
        }, 0) / 60);
  
      if ((+lastSentTime != +timeLeft && intervalIndex%4==0) && errorWhenSending == false) {
        lastSentTime = timeLeft
        try {
          fetch('https://ntfy.sh/jgghwhegellg', { method: 'POST', body:timeLeft+" min" })
        } catch (e) {
          console.log(e)
          errorWhenSending = true
        }
      }
  
      document.querySelector('#timeLeft span').innerText = timeLeft + " minutes";
  
      if (timeLeft == 0) {
        clearInterval(timeLeftInterval);
        document.querySelector('#timeLeft span').outerHTML = "";
        timeLeftInterval = 0;
        intervalIndex = 0;
      }
  
    }, 5000);
    
  }
}

