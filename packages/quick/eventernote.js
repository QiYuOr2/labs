function parseItem(item) {
  const result = {};

  // 日期
  const dateText = item.querySelector(".date")?.textContent.trim();
  result.date = dateText || "";

  // 图片
  const img = item.querySelector(".date img");
  result.image = img?.src || "";
  result.imageAlt = img?.alt || "";

  // 活动标题
  const titleLink = item.querySelector(".event h4 a");
  result.title = titleLink?.textContent.trim() || "";
  result.eventUrl = titleLink?.href || "";

  // 会场
  const placeLink = item.querySelectorAll(".event .place a")?.[0];
  result.place = {
    name: placeLink?.textContent.trim() || "",
    url: placeLink?.href || "",
  };

  // 时间
  const timeText = item.querySelectorAll(".event .place")?.[1]?.textContent.trim();
  const match = timeText?.match(/開場\s*(\d{1,2}:\d{2})\s*開演\s*(\d{1,2}:\d{2})\s*終演\s*(\d{1,2}:\d{2})/);
  result.time = match
    ? {
        open: match[1],
        start: match[2],
        end: match[3],
      }
    : {};

  // 出演者
  const actors = Array.from(item.querySelectorAll(".actor ul li a")).map((a) => ({
    name: a.textContent.trim(),
    url: a.href,
  }));
  result.actors = actors;

  // 参加者数
  const participants = item.querySelector(".note_count p")?.textContent.trim();
  result.participants = Number(participants) || 0;

  // 输出结果
  return result
}



let result = Array.from(document.querySelectorAll('.gb_event_list ul li.clearfix')).reduce((result, current) => {
  result.push(parseItem(current))
  return result 
}, [])