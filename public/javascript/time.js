import { DateTime } from "luxon";

document.addEventListener("DOMContentLoaded", function() {
  const dailyOutput = document.getElementById("daily");
  const weeklyOutput =  document.getElementById("weekly");
  dailyOutput.style.textAlign = "center";
  weeklyOutput.style.textAlign = "center";
    function updateCountdown() {
     

      const now = DateTime.utc();
      let wednesday = DateTime.utc().set({weekday: 3, hour: 0, minute: 0, second: 0, millisecond: 0});
      if (now >= wednesday) {
        wednesday = wednesday.plus({ weeks: 1 });
      }
      const diff = wednesday.diff(now);

      let daily = DateTime.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0});
      daily = daily.plus({days: 1});
      daily = daily.diff(now);

      daily = daily.toFormat("hh:mm:ss");
      const weekly = diff.toFormat("dd:hh:mm:ss");
      
      weeklyOutput.innerHTML = `Until Week Reset<br> ${weekly}`;
      dailyOutput.innerHTML = `Until Daily Reset<br> ${daily}`;
    }
    setInterval(updateCountdown, 1000);

  });

