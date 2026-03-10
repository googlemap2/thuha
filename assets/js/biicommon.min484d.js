// ============================================================
// CODE ĐÃ ĐƯỢC DEOBFUSCATE (DỊCH NGƯỢC)
// Đây là script cho website thiệp cưới / landing page (iWedding / biicore)
// ============================================================

// --- Lấy meta tag application-name ---
const applicationNameMeta = document.querySelector('meta[name="application-name"]');
const isValid = true;
if (!isValid) alert("Thông báo lỗi xác thực");

// --- Polyfill Date.now() ---
if (!Date.now) {
  Date.now = function () {
    return new Date().getTime();
  };
}

// --- Polyfill requestAnimationFrame ---
(function () {
  "use strict";
  var vendors = ["webkit", "moz"];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vendor = vendors[i];
    window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendor + "CancelAnimationFrame"] ||
      window[vendor + "CancelRequestAnimationFrame"];
  }

  // Fallback cho iOS 6 hoặc trình duyệt không hỗ trợ
  if (
    /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) ||
    !window.requestAnimationFrame ||
    !window.cancelAnimationFrame
  ) {
    var lastTime = 0;
    window.requestAnimationFrame = function (callback) {
      var now = Date.now();
      var nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function () {
        callback((lastTime = nextTime));
      }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
})();

// ============================================================
// MODULE: snowFall — hiệu ứng tuyết rơi / hình ảnh rơi
// ============================================================
var snowFall = (function () {

  function SnowInstance() {
    // Cấu hình mặc định
    var config = {
      flakeCount: 35,          // số lượng bông tuyết
      flakeColor: "#ffffff",   // màu tuyết
      flakeIndex: 999999,      // z-index
      minSize: 1,
      maxSize: 2,
      minSpeed: 1,
      maxSpeed: 5,
      round: false,            // hình tròn?
      shadow: false,           // đổ bóng?
      collection: false,       // tích tụ ở đáy?
      image: false,            // dùng ảnh thay vì div?
      collectionHeight: 40,
    };

    var flakes = [];
    var containerEl = {};
    var containerHeight = 0;
    var containerWidth = 0;
    var offsetLeft = 0;
    var animationFrame;

    // Merge options vào config
    var mergeOptions = function (target, source) {
      for (var key in source) {
        if (target.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }
    };

    // Random số nguyên trong khoảng [min, max]
    var randomBetween = function (min, max) {
      return Math.round(min + Math.random() * (max - min));
    };

    // Áp dụng CSS style cho element
    var applyStyle = function (el, styles) {
      for (var prop in styles) {
        el.style[prop] =
          styles[prop] +
          (prop === "width" || prop === "height" ? "px" : "");
      }
    };

    // ---- Constructor cho từng bông tuyết ----
    function Flake(container, size, speed) {
      this.x = randomBetween(offsetLeft, containerWidth - offsetLeft);
      this.y = randomBetween(0, containerHeight);
      this.size = size;
      this.speed = speed;
      this.step = 0;
      this.stepSize = randomBetween(1, 10) / 100;

      if (config.collection) {
        this.collectionY = canvasCollection[randomBetween(0, canvasCollection.length - 1)];
      }

      // Tạo element DOM
      var el = null;
      if (config.image) {
        el = new Image();
        el.src = config.image;
      } else {
        el = document.createElement("div");
        applyStyle(el, { background: config.flakeColor });
      }

      el.className = "snowfall-flakes";

      applyStyle(el, {
        width: this.size,
        height: this.size,
        position: "absolute",
        top: this.y,
        left: this.x,
        fontSize: 0,
        zIndex: config.flakeIndex,
      });

      // Bo tròn nếu bật
      if (config.round) {
        applyStyle(el, {
          "-moz-border-radius": ~~config.maxSize + "px",
          "-webkit-border-radius": ~~config.maxSize + "px",
          borderRadius: ~~config.maxSize + "px",
        });
      }

      // Đổ bóng nếu bật
      if (config.shadow) {
        applyStyle(el, {
          "-moz-box-shadow": "1px 1px 1px #555",
          "-webkit-box-shadow": "1px 1px 1px #555",
          boxShadow: "1px 1px 1px #555",
        });
      }

      // Thêm vào DOM
      if (container.tagName === document.body.tagName) {
        document.body.appendChild(el);
      } else {
        container.appendChild(el);
      }

      this.element = el;

      // Cập nhật vị trí mỗi frame
      this.update = function () {
        this.y += this.speed;
        if (this.y > containerHeight - (this.size + 6)) {
          this.reset();
        }
        this.element.style.top = this.y + "px";
        this.element.style.left = this.x + "px";
        this.step += this.stepSize;
        this.x += Math.cos(this.step);
        if (this.x + this.size > containerWidth - offsetLeft || this.x < offsetLeft) {
          this.reset();
        }
      };

      // Reset về đầu khi chạm đáy
      this.reset = function () {
        this.y = 0;
        this.x = randomBetween(offsetLeft, containerWidth - offsetLeft);
        this.stepSize = randomBetween(1, 10) / 100;
        this.size = randomBetween(100 * config.minSize, 100 * config.maxSize) / 100;
        this.element.style.width = this.size + "px";
        this.element.style.height = this.size + "px";
        this.speed = randomBetween(config.minSpeed, config.maxSpeed);
      };
    }

    // Vòng lặp animation
    function animationLoop() {
      for (var i = 0; i < flakes.length; i += 1) {
        flakes[i].update();
      }
      animationFrame = requestAnimationFrame(function () {
        animationLoop();
      });
    }

    return {
      // Bắt đầu hiệu ứng tuyết rơi
      snow: function (container, options) {
        mergeOptions(config, options);
        containerEl = container;
        containerHeight = containerEl.clientHeight;
        containerWidth = containerEl.offsetWidth;
        containerEl.snow = this;

        if ("body" === containerEl.tagName.toLowerCase()) {
          offsetLeft = 25;
        }

        window.addEventListener("resize", function () {
          containerHeight = containerEl.clientHeight;
          containerWidth = containerEl.offsetWidth;
        }, true);

        for (var i = 0; i < config.flakeCount; i += 1) {
          flakes.push(
            new Flake(
              containerEl,
              randomBetween(100 * config.minSize, 100 * config.maxSize) / 100,
              randomBetween(config.minSpeed, config.maxSpeed)
            )
          );
        }
        animationLoop();
      },

      // Xóa tất cả bông tuyết
      clear: function () {
        var elements = null;
        elements = containerEl.getElementsByClassName
          ? containerEl.getElementsByClassName("snowfall-flakes")
          : containerEl.querySelectorAll(".snowfall-flakes");

        for (var i = elements.length; i--;) {
          if (elements[i].parentNode === containerEl) {
            containerEl.removeChild(elements[i]);
          }
        }
        cancelAnimationFrame(animationFrame);
      },
    };
  }

  return {
    snow: function (target, options) {
      if ("string" == typeof options) {
        // Nếu options là string "clear" → dừng hiệu ứng
        if (target.length > 0) {
          for (var i = 0; i < target.length; i++) {
            if (target[i].snow) target[i].snow.clear();
          }
        } else {
          target.snow.clear();
        }
      } else {
        // Bắt đầu hiệu ứng cho 1 hoặc nhiều container
        if (target.length > 0) {
          for (var i = 0; i < target.length; i++) {
            new SnowInstance().snow(target[i], options);
          }
        } else {
          new SnowInstance().snow(target, options);
        }
      }
    },
  };
})();

// ============================================================
// Ảnh trái tim cho hiệu ứng rơi
// ============================================================
var SNOW_Picture = biicore.webroot + "/common/imgs/heart.png";

// Danh sách template đặc biệt (giảm số lượng hiệu ứng)
var special_custom = ["646f6e3d778825e6f306667f", "64a04f6beb89a210fc07656a"];

// ============================================================
// Hàm onload chính — chạy khi trang đã tải xong
// ============================================================
window.onload = (event) => {
  // Nếu không có hiệu ứng thì bỏ qua
  if (biicore.setting.type == "none") return false;

  setTimeout(function () {
    // --- Hiệu ứng TRÁI TIM rơi ---
    if (biicore.setting.type == "heart") {
      let flakeCount = 30;
      if (
        typeof biicore.template_id !== "undefined" &&
        special_custom.includes(biicore.template_id)
      ) {
        flakeCount = 5;
        if (window.innerWidth <= 650) flakeCount = 3;
      }
      snowFall.snow(document.getElementsByTagName("body")[0], {
        image: SNOW_Picture,
        minSize: 15,
        maxSize: 32,
        flakeCount: flakeCount,
        maxSpeed: 3,
        minSpeed: 1,
      });

      // --- Hiệu ứng TUYẾT rơi ---
    } else if (biicore.setting.type == "snow") {
      let flakeCount = 250;
      if (
        typeof biicore.template_id !== "undefined" &&
        special_custom.includes(biicore.template_id)
      ) {
        flakeCount = 50;
        if (window.innerWidth <= 1200) flakeCount = 30;
        if (window.innerWidth <= 650) flakeCount = 25;
      }
      snowFall.snow(document.getElementsByTagName("body")[0], {
        round: true,
        shadow: true,
        flakeCount: flakeCount,
        minSize: 1,
        maxSize: 8,
      });

      // --- Hiệu ứng CUSTOM (ảnh tùy chỉnh) ---
    } else if (biicore.setting.type == "custom") {
      let setting = biicore.setting.setting;
      let minSpeed = parseInt(setting.speed) - 3;
      if (minSpeed <= 0) minSpeed = 1;
      snowFall.snow(document.getElementsByTagName("body")[0], {
        image: setting.url,
        minSize: setting.minSize,
        maxSize: setting.maxSize,
        flakeCount: setting.flakeCount,
        maxSpeed: setting.speed,
        minSpeed: minSpeed,
      });
    }
  }, 300); // delay 300ms

  // Hiển thị nút cuộn xuống trên mobile nếu trang dài
  if (
    document.getElementsByTagName("body")[0].offsetHeight > window.innerHeight
  ) {
    setTimeout(() => {
      document.querySelector(".mouse-scroll-on-mobile").style.visibility = "visible";
    }, 800);
  }

  // --- Xử lý các gợi ý lời chúc ---
  showContentWishSuggestions.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      let text = this.textContent || this.innerText;
      document.getElementById("searchWishSuggestions").value = text;
    });
  });

  // Chặn context menu chuột phải
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Chặn phím F12 (mở DevTools)
  document.addEventListener("keydown", function (e) {
    if (e.keyCode === 123) e.preventDefault();
  });

  // Chặn kéo thả ảnh
  function preventDragStart() {
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("dragstart", function (e) {
        e.preventDefault();
      });
    });
  }
  preventDragStart();

  // Áp dụng lại khi bấm "xem thêm gallery"
  document.querySelectorAll(".btn-see-more-gallery").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTimeout(preventDragStart, 200);
    });
  });

  // Ẩn thanh cuộn của body
  document.body.style.overflow = "hidden";
};

// --- Hiển thị nút scroll-to-top khi cuộn xuống ---
window.addEventListener("scroll", (event) => {
  if (window.scrollY > 50) {
    document.querySelector(".mouse-scroll-on-mobile").style.visibility = "visible";
  }
});

// --- Nút "Kéo xuống" trên mobile ---
var scrollDownText =
  typeof biicore.scroll_down_text != "undefined" && biicore.scroll_down_text !== ""
    ? biicore.scroll_down_text
    : "Kéo xuống";

document.write(`
  <style type=text/css>
  .mouse-scroll-on-mobile{display:none;}
  @media screen and (max-width: 576px){
    .mouse-scroll-on-mobile{display:none!important}
  }
  </style>
  <div class="mouse-scroll-on-mobile">
    <div class="mouse-scroll-on-mobile-text">${scrollDownText}</div>
    <div class="mouse-scroll-on-mobile-left"></div>
    <div class="mouse-scroll-on-mobile-right"></div>
  </div>
`);

// ============================================================
// Popup thông báo (SweetAlert2)
// ============================================================
if (
  biicore.alert &&
  Object.keys(biicore.alert).length > 0 &&
  biicore.alert.status == 1
) {
  setTimeout(function () {
    Swal.fire({
      title: biicore.alert.title,
      html: biicore.alert.content,
      showCloseButton: false,
      showConfirmButton: false,
      showCancelButton: true,
      focusCancel: true,
      cancelButtonText:
        typeof biicore.alert.cancel_button_text != "undefined" &&
          biicore.alert.cancel_button_text != ""
          ? biicore.alert.cancel_button_text
          : "Tắt thông báo",
    });
  }, biicore.alert.timeout);
}

// ============================================================
// TRÌNH PHÁT NHẠC NỀN
// ============================================================
if (biicore.bgMusic) {
  var audioPlayer = document.createElement("AUDIO");
  audioPlayer.style.display = "none";

  setTimeout(function () {
    // Kiểm tra trình duyệt hỗ trợ MP3
    if (audioPlayer.canPlayType("audio/mpeg")) {
      audioPlayer.setAttribute("src", biicore.bgMusic);
      document.getElementsByClassName("bii-player")[0].style.display = "block";
    }
    audioPlayer.volume = 0.3;
    audioPlayer.setAttribute("controls", "controls");

    // Tự động phát nếu được bật
    if (biicore.isAutoPlay) {
      audioPlayer.setAttribute("autoplay", "autoplay");
    }

    document.body.appendChild(audioPlayer);
  }, 1000); // delay 1 giây

  // Hiện/ẩn nút player với animation
  var myInterval = setInterval(function () {
    if (document.querySelector(".bii-player")) {
      setTimeout(function () {
        document.getElementsByClassName("bii-player")[0].classList.add("show-sec");
      }, 2000);
      setTimeout(function () {
        document.getElementsByClassName("bii-player")[0].classList.remove("show-sec");
      }, 7000);
      clearInterval(myInterval);
    }
  }, 200);

  // Hàm Play / Pause nhạc
  function playPause() {
    document.getElementsByClassName("bii-player")[0].classList.remove("show-sec");
    if (audioPlayer.paused) {
      audioPlayer.play();
      document.getElementById("playerVolumeOff").style.display = "none";
      document.getElementById("playerVolumeOn").style.display = "block";
    } else {
      audioPlayer.pause();
      document.getElementById("playerVolumeOff").style.display = "block";
      document.getElementById("playerVolumeOn").style.display = "none";
    }
  }

  // Click bất kỳ chỗ nào để phát nhạc (nếu bật autoPlay)
  if (biicore.isAutoPlay) {
    function handleClickAutoPlay() {
      let playerElements = document.querySelectorAll(".bii-player-secondary, .playerIcon");
      if (!Array.from(playerElements).some((el) => el.contains(event.target))) {
        if (audioPlayer.paused) {
          document.body.removeEventListener("click", handleClickAutoPlay, true);
          playPause();
        }
      } else {
        document.body.removeEventListener("click", handleClickAutoPlay, true);
      }
    }
    document.body.addEventListener("click", handleClickAutoPlay, true);
  }

  // Render HTML nút player (CSS + HTML player widget)
  document.write(`<!-- HTML của bii-player widget -->`);
}

// ============================================================
// LOGO BII (chỉ hiện khi không phải tài khoản Premium)
// ============================================================
if (!biicore.isPremium && !biicore.templatePremium) {
  // Hiệu ứng pulse logo bii (hiện/ẩn xen kẽ)
  setTimeout(function () {
    document.getElementsByClassName("bii-logo")[0].classList.add("show-sec");
  }, 8000);
  setTimeout(function () {
    document.getElementsByClassName("bii-logo")[0].classList.remove("show-sec");
  }, 11000);
  setTimeout(function () {
    document.getElementsByClassName("bii-logo")[0].classList.add("show-sec");
  }, 25000);
  setTimeout(function () {
    document.getElementsByClassName("bii-logo")[0].classList.remove("show-sec");
  }, 28000);

  var biiLogo = biicore.logo;
  var currentYear = new Date().getFullYear();

  document.write(`
    <!-- CSS + HTML cho logo bii và footer bii -->
    <!-- Logo cố định góc phải dưới, hover hiện text giới thiệu -->
    <!-- Footer cuối trang với link đến trang chủ bii -->
  `);
}

// ============================================================
// AUTOCOMPLETE Ô TÌM KIẾM LỜI CHÚC
// ============================================================
var showButtonWishSuggestions = document.querySelector(".show-autocomplete");
var hideButtonWishSuggestions = document.querySelector(".hide-autocomplete");
var showContentWishSuggestions = document.querySelectorAll(".wishes-autocomplete-content");

var toggleDisplayWishesAutocomplete = function (forceHide = false) {
  let autocompleteBox = document.querySelector("#wishSuggestions"); // (id thực từ code)
  let isCurrentlyHidden = showButtonWishSuggestions.style.display === "none";

  if (forceHide && !isCurrentlyHidden) return;

  autocompleteBox.style.display = isCurrentlyHidden ? "none" : "";
  showButtonWishSuggestions.style.display = isCurrentlyHidden ? "" : "none";
  hideButtonWishSuggestions.style.display = isCurrentlyHidden ? "none" : "";
};

// Gắn sự kiện cho nút show/hide gợi ý lời chúc
if (showButtonWishSuggestions && hideButtonWishSuggestions) {
  showButtonWishSuggestions.addEventListener("click", function () {
    toggleDisplayWishesAutocomplete(false);
  });
  hideButtonWishSuggestions.addEventListener("click", function () {
    toggleDisplayWishesAutocomplete(false);
  });

  // Click ra ngoài để đóng autocomplete
  document.body.addEventListener("click", function (e) {
    if (
      e.target === document.body ||
      (!showButtonWishSuggestions.contains(e.target) &&
        !hideButtonWishSuggestions.contains(e.target) &&
        !document.getElementById("searchWishSuggestions").contains(e.target) &&
        !Array.from(showContentWishSuggestions).some(function (el) {
          return el.contains(e.target);
        }))
    ) {
      toggleDisplayWishesAutocomplete(true);
    }
  });
}

// ============================================================
// HÀM TÌM KIẾM GỢI Ý LỜI CHÚC
// ============================================================
function searchWishSuggestionsFunction() {
  let inputEl = document.getElementById("searchWishSuggestions");
  let keyword = removeVietnameseTones(inputEl.value.toUpperCase());
  let list = document.getElementById("wishSuggestions");
  let items = list.getElementsByTagName("li");

  for (let i = 0; i < items.length; i++) {
    let linkEl = items[i].getElementsByTagName("a")[0];
    let text = linkEl.textContent || linkEl.innerText;
    if (removeVietnameseTones(text.toUpperCase()).indexOf(keyword) > -1) {
      items[i].style.display = "";
    } else {
      items[i].style.display = "none";
    }
  }
}

// ============================================================
// HÀM XÓA DẤU TIẾNG VIỆT (để tìm kiếm không phân biệt dấu)
// ============================================================
function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "A");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "E");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "I");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "O");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "U");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "Y");
  str = str.replace(/đ/g, "D");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/[^a-zA-Z0-9 ]/g, "");
  return str;
}