document.addEventListener("DOMContentLoaded", function () {

    // 1. KHÓA SCROLL CHUNG MẶC ĐỊNH
    document.body.classList.add("locked");

    // ==========================================
    // SECTION 1: SLIDESHOW & UNLOCK AUDIO
    // ==========================================
    const imageList = [
        "1.png", "2.png", "3.png", "4.png", "5.png",
        "6.png", "7.png", "8.png", "9.png", "10.png"
    ];

    const slideshowContainer = document.getElementById("slideshow-container");
    if (slideshowContainer && slideshowContainer.children.length <= 3) {
        // Giữ lại 3 slide video ban đầu (nếu có), thêm danh sách 10 ảnh vào sau
        imageList.forEach(imgName => {
            const slideDiv = document.createElement("div");
            slideDiv.className = "slide";
            slideDiv.innerHTML = `<img src="assets/images/${imgName}" alt="Ảnh lớp 9A7">`;
            slideshowContainer.appendChild(slideDiv);
        });
    }

    // Xử lý tự động thay ảnh 1.png nếu Video ở Hero Section bị lỗi mạng/lỗi link
    const heroVideos = document.querySelectorAll(".hero-section video");
    heroVideos.forEach(vid => {
        vid.addEventListener("error", function () {
            const fallbackImg = document.createElement("img");
            fallbackImg.src = "assets/images/1.png";
            fallbackImg.alt = "Ảnh lớp 9A7 dự phòng";
            fallbackImg.style.width = "100%";
            fallbackImg.style.height = "100%";
            fallbackImg.style.objectFit = "cover";

            if (this.parentNode) {
                this.parentNode.replaceChild(fallbackImg, this);
            }
        });
    });

    const slides = document.querySelectorAll(".slide");
    let currentSlide = 0;
    let slideTimer = null;
    const standardImageSpeed = 1200; // Tốc độ ảnh thông thường (1.2s)
    const firstImageSpeed = 1500;    // Tốc độ riêng cho ảnh 1.png (1.5s)

    function playCurrentSlide() {
        if (slides.length === 0) return;

        // Xóa trạng thái active của tất cả các slide
        slides.forEach(s => s.classList.remove("active"));
        if (slideTimer) clearTimeout(slideTimer);

        const activeSlide = slides[currentSlide];
        activeSlide.classList.add("active");

        const currentVideo = activeSlide.querySelector("video");
        const currentImg = activeSlide.querySelector("img");

        if (currentVideo) {
            // --- CẤU HÌNH TỐC ĐỘ 3 VIDEO ĐẦU ---
            currentVideo.currentTime = 0;

            if (currentSlide === 1) {
                currentVideo.playbackRate = 1.3; // Video 1 -> Tốc độ 1.3
            } else if (currentSlide === 2) {
                currentVideo.playbackRate = 1.3; // Video 2 -> Tốc độ 1.3
            } else if (currentSlide === 3) {
                currentVideo.playbackRate = 0.7; // Video 3 -> Tốc độ 0.7
            } else {
                currentVideo.playbackRate = 1.0;
            }

            currentVideo.play().catch(() => {});
            currentVideo.onended = function () {
                nextSlide();
            };
        } else {
            // --- CẤU HÌNH THỜI GIAN HIỂN THỊ ẢNH ---
            let duration = standardImageSpeed;

            // Nếu là ảnh 1.png (Slide đầu tiên dạng ảnh) -> Chạy 1.5s (1500ms)
            if (currentImg && currentImg.src.includes("1.png")) {
                duration = firstImageSpeed;
            }

            slideTimer = setTimeout(nextSlide, duration);
        }
    }

    function nextSlide() {
        if (slideTimer) clearTimeout(slideTimer);
        currentSlide = (currentSlide + 1) % slides.length;
        playCurrentSlide();
    }

    // Bắt đầu chạy Slideshow
    playCurrentSlide();

    const introAudio = document.getElementById("intro-audio");
    const unlockBtn = document.getElementById("btn-unlock");

    if (introAudio && unlockBtn) {
        let playPromise = introAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                unlockBtn.disabled = false;
                unlockBtn.classList.remove("btn-disabled");
                unlockBtn.classList.add("btn-active");
                unlockBtn.innerHTML = "🔊 BẤM ĐỂ PHÁT AUDIO 9A7";
                unlockBtn.dataset.state = "need-click";
            });
        }

        introAudio.addEventListener("ended", function () {
            unlockBtn.disabled = false;
            unlockBtn.classList.remove("btn-disabled");
            unlockBtn.classList.add("btn-active");
            unlockBtn.innerHTML = "🔓 BẮT ĐẦU GIẢI MÃ 9A7 ↓";
            unlockBtn.dataset.state = "unlocked";
        });

        unlockBtn.addEventListener("click", function () {
            if (unlockBtn.dataset.state === "need-click") {
                introAudio.play();
                unlockBtn.disabled = true;
                unlockBtn.classList.remove("btn-active");
                unlockBtn.classList.add("btn-disabled");
                unlockBtn.innerHTML = "🔒 ĐANG GIẢI MÃ AUDIO 9A7...";
                unlockBtn.dataset.state = "playing";
                return;
            }

            if (unlockBtn.dataset.state === "unlocked" || !unlockBtn.disabled) {
                // Chuyển sang Section 2
                const section2 = document.getElementById("section-2");
                if (section2) {
                    window.scrollTo({
                        top: section2.offsetTop,
                        behavior: "smooth"
                    });
                }

                // Phát nhạc nền nhè nhẹ Section 2 (chạy liên tục xuyên suốt)
                const sec2BgMusic = document.getElementById("sec2-bg-music");
                if (sec2BgMusic) {
                    sec2BgMusic.volume = 0.3; // Âm lượng nhè nhẹ 30%
                    sec2BgMusic.play().catch(() => {});
                }

                // Bắt đầu chuỗi tự động phát Audio các thẻ
                startQuoteSequence(0);
            }
        });
    }

    // ==========================================
    // SECTION 2: CAROUSEL CHẠY AUDIO TỰ ĐỘNG & ĐỔI THẺ
    // ==========================================
    const quoteSection = document.getElementById("section-2");
    const quoteCards = document.querySelectorAll(".quote-card");
    const dots = document.querySelectorAll(".dot");
    const prevBtn = document.getElementById("prev-quote");
    const nextBtn = document.getElementById("next-quote");
    const quotePlayer = document.getElementById("quote-player");
    let currentQuote = 0;

    // Danh sách audio giọng đọc ngâm thơ tương ứng 3 thẻ
    const quoteAudios = [
        "assets/audios/quote-1.mp3",
        "assets/audios/quote-2.mp3",
        "assets/audios/quote-3.mp3"
    ];

    function showQuoteUI(index) {
        if (quoteCards.length === 0) return;
        
        quoteCards.forEach(card => card.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));

        const targetCard = quoteCards[index];
        targetCard.classList.add("active");
        if (dots[index]) dots[index].classList.add("active");

        const themeClass = targetCard.getAttribute("data-theme");
        if (quoteSection) quoteSection.className = `quote-section ${themeClass}`;
    }

    // Luồng tự động: Phát audio -> Hết audio -> Tự đổi thẻ -> Hết Thẻ 3 xuống Sec 3
    function startQuoteSequence(index) {
        if (index >= quoteCards.length) return;

        currentQuote = index;
        showQuoteUI(index);

        if (quotePlayer) {
            quotePlayer.src = quoteAudios[index];
            
            // Nếu hết bài audio thì thực hiện bước tiếp theo
            quotePlayer.onended = function () {
                if (index < quoteCards.length - 1) {
                    // Còn thẻ tiếp theo -> Đợi 1 giây rồi sang thẻ tiếp
                    setTimeout(() => {
                        startQuoteSequence(index + 1);
                    }, 1000);
                } else {
                    // Đã phát xong trọn vẹn Audio Thẻ 3 -> Đợi 2s rồi cuộn xuống Section 3
                    setTimeout(() => {
                        const section3 = document.getElementById("section-3");
                        if (section3) {
                            window.scrollTo({
                                top: section3.offsetTop,
                                behavior: "smooth"
                            });
                            triggerSection3Sequence();
                        }
                    }, 2000);
                }
            };

            // Phòng trường hợp thiếu file audio/lỗi -> Dự phòng 6s tự qua thẻ
            quotePlayer.onerror = function () {
                setTimeout(() => {
                    if (index < quoteCards.length - 1) {
                        startQuoteSequence(index + 1);
                    } else {
                        const section3 = document.getElementById("section-3");
                        if (section3) {
                            window.scrollTo({ top: section3.offsetTop, behavior: "smooth" });
                            triggerSection3Sequence();
                        }
                    }
                }, 6000);
            };

            quotePlayer.play().catch(() => {
                // Nếu trình duyệt chặn phát -> Tự động chuyển qua sau 6 giây
                setTimeout(() => {
                    if (index < quoteCards.length - 1) {
                        startQuoteSequence(index + 1);
                    } else {
                        const section3 = document.getElementById("section-3");
                        if (section3) {
                            window.scrollTo({ top: section3.offsetTop, behavior: "smooth" });
                            triggerSection3Sequence();
                        }
                    }
                }, 6000);
            });
        }
    }

    // Cho phép bấm nút điều khiển thủ công nếu người dùng muốn tua xem lại
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener("click", function () {
            currentQuote = (currentQuote + 1) % quoteCards.length;
            startQuoteSequence(currentQuote);
        });

        prevBtn.addEventListener("click", function () {
            currentQuote = (currentQuote - 1 + quoteCards.length) % quoteCards.length;
            startQuoteSequence(currentQuote);
        });

        dots.forEach((dot, idx) => {
            dot.addEventListener("click", function () {
                startQuoteSequence(idx);
            });
        });
    }

    // ==========================================
    // SECTION 3: NEON & VOICE SEQUENCE TỰ ĐỘNG
    // ==========================================
    const emotionText = "Nhưng nếu chỉ tri ân những người đứng trên bục giảng, có lẽ 9A7 vẫn chưa học hết bài học làm người. Sự tận tụy giữ cho mái trường này ấm áp không chỉ đến từ phấn trắng bảng đen...";
    const typewriterElem = document.getElementById("typewriter-text");
    const unseenGrid = document.getElementById("unseen-cards-grid");
    const twistVoicePlayer = document.getElementById("twist-voice-player");
    let hasTypedSec3 = false;

    function triggerSection3Sequence() {
        if (hasTypedSec3) return;
        hasTypedSec3 = true;

        let i = 0;
        if (typewriterElem) typewriterElem.innerHTML = "";
        const speed = 40;

        function type() {
            if (i < emotionText.length) {
                if (typewriterElem) typewriterElem.innerHTML += emotionText.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(() => {
                    const textBox = document.querySelector(".emotion-text-box");
                    if (textBox) textBox.classList.add("fade-out");

                    setTimeout(() => {
                        if (unseenGrid) {
                            unseenGrid.classList.remove("hidden-grid");
                            unseenGrid.classList.add("show-grid");
                        }
                        startSec3VoiceSequence();
                    }, 600);
                }, 1500);
            }
        }
        type();
    }

    function playAudioPromise(src) {
        return new Promise((resolve) => {
            if (!twistVoicePlayer) return resolve();

            twistVoicePlayer.src = src;
            twistVoicePlayer.onended = () => resolve();
            twistVoicePlayer.onerror = () => resolve();
            
            let playPromise = twistVoicePlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    setTimeout(resolve, 4000);
                });
            }
        });
    }

    async function startSec3VoiceSequence() {
        const cardBaoVe = document.getElementById("card-bao-ve");
        const cardLaoCong = document.getElementById("card-lao-cong");

        // BƯỚC 1: Sáng Neon Bác Bảo Vệ
        if (cardBaoVe) cardBaoVe.classList.add("neon-active");
        await playAudioPromise("assets/audios/sec3-bao-ve.mp3");

        // BƯỚC 2: Tắt Bảo Vệ -> Sáng Neon Thầy Cô Lao Thầy Công
        if (cardBaoVe) cardBaoVe.classList.remove("neon-active");
        if (cardLaoCong) cardLaoCong.classList.add("neon-active");
        await playAudioPromise("assets/audios/sec3-lao-cong.mp3");

        // BƯỚC 3: Mở khóa cuộn xuống Section 4
        if (cardLaoCong) cardLaoCong.classList.remove("neon-active");
        document.body.classList.remove("locked");
    }

    // ==========================================
    // SECTION 4: 28 HỌC SINH (NHẬP 2 MÀU THỦ CÔNG & PHÓNG TO CHI TIẾT)
    // ==========================================
    
    // Mảng cấu hình 28 học sinh (Bạn tự tay nhập bgColor & textColor thoải mái tại đây)
    const studentsConfig = [
        {
            name: "Trà My",
            bgColor: "#b0cdef", textColor: "#6883a3",
            video: "assets/videos/student-1.mp4",
            subOriginal: "🇬🇧 Thank you for always standing by our side and supporting us. You make every day at school a wonderful memory. 🇨🇳 老师， 感谢您的付出。 9A7 永远爱您！", 
            subEn: "Thank you for always standing by our side and supporting us. You make every day at school a wonderful memory. Teacher, thank you for your dedication. 9A7 loves you forever!", 
            subVi: "Cảm ơn Thầy Cô vì đã luôn sát cánh và hỗ trợ chúng em. Thầy Cô khiến mỗi ngày đến trường đều là kỷ niệm tuyệt đẹp. Thầy Cô ơi, cảm ơn sự tận tụy của Thầy Cô, 9A7 mãi yêu Thầy Cô!" 
        },
        { 
            id: 2, name: "Gia Phát", bgColor: "#C5908E", textColor: "#844f4d", 
            video: "assets/videos/student-2.mp4", 
            subOriginal: "🇻🇳 \"Mong thầy cô luôn nở nụ cười thật tươi mỗi khi bước vào lớp 9A7 ạ!\"", 
            subEn: "Wishing our teachers always have a bright smile whenever entering class 9A7!", 
            subVi: "" 
        },
        { 
            id: 3, name: "Châu Anh", bgColor: "#04172b", textColor: "#04172b", 
            video: "assets/videos/student-3.mp4",  
            subOriginal: "Thank you so much for everything from 9A7!", 
            subEn: "",
            subVi: "Cảm ơn thầy cô vì tất cả, chúng em yêu 9A7!" 
        },
        { 
            id: 4, name: "Việt Bách", bgColor: "#8E918F", textColor: "#38443c", 
            video: "assets/videos/student-4.mp4", 
            subOriginal: "🇻🇳 \"Nhiều lúc 9A7 làm thầy cô đau đầu, nhưng tư duy của chúng em là luôn biết ơn thầy cô ạ!\"", 
            subEn: "Though 9A7 often gives teachers headaches, our mindset is to always be grateful to you!", 
            subVi: "" 
        },
        { 
            id: 5, name: "Chi Mai", bgColor: "#39d0db", textColor: "#0c8d96", 
            video: "assets/videos/student-5.mp4", 
            subOriginal: "We promise to keep working hard every single day.",
            subEn: "",
            subVi: "Cảm ơn thầy cô vì sự tận tụy và kiên nhẫn dành cho 9A7. Chúng em hứa sẽ tiếp tục cố gắng mỗi ngày." 
        },
        { 
            id: 6, name: "Nhật Minh", bgColor: "#4682B4", textColor: "#4682B4", 
            video: "assets/videos/student-6.mp4", 
            subOriginal: "🇻🇳 \"Dù 9A7 hay bị nhắc nhở, nhưng tình yêu chúng em dành cho thầy cô là không đổi ạ!\"", 
            subEn: "Though 9A7 often gets reminded, our love for teachers never changes!", 
            subVi: "" 
        },
        { 
            id: 7, name: "Gia Hân", bgColor: "#919f8e", textColor: "#597253", 
            video: "assets/videos/student-7.mp4", 
            subOriginal: "🇷🇺 \"Спасибо вам, учителям, Девять А Семь любит вас!", 
            subEn: "Thank you teachers, 9A7 loves you so much!", 
            subVi: "Cảm ơn thầy cô, 9A7 yêu thầy cô nhiều lắm ạ!" 
        },
        { 
            id: 8, name: "Xuân Bách", bgColor: "#4A3B32", textColor: "#4A3B32", 
            video: "assets/videos/student-8.mp4", 
            subOriginal: "🇻🇳 \"Dù mới gia nhập 9A7 chưa lâu nhưng em cảm nhận được sự ấm áp từ các thầy cô. Em chúc thầy cô có một ngày 20/11 thật tuyệt vời!\"", 
            subEn: "Even though I recently joined 9A7, I feel the warmth from our teachers. Wishing you a wonderful Teacher's Day!", 
            subVi: "" 
        },
        { 
            id: 9, name: "Gia Bảo", bgColor: "#C15C3D", textColor: "#963b1e", 
            video: "assets/videos/student-9.mp4", 
            subOriginal: "🇨🇳 \"感谢老师们，九A七祝大家节日快乐！", 
            subEn: "Thank you teachers, 9A7 wishes everyone a Happy Teacher's Day!", 
            subVi: "Cảm ơn các thầy cô, 9A7 chúc thầy cô có một ngày lễ thật hạnh phúc!" 
        },
        { 
            id: 10, name: "Bảo Minh", bgColor: "#002366", textColor: "#002366", 
            video: "assets/videos/student-10.mp4", 
            subOriginal: "🇻🇳 \"Chúc các thầy cô luôn dồi dào sức khỏe để chèo lái những chuyến đò 9A7 tiếp theo ạ!\"", 
            subEn: "Wishing our teachers good health to keep guiding future 9A7 generations!", 
            subVi: "" 
        },
        { 
            id: 11, name: "Yến Ngọc", bgColor: "#85274b", textColor: "#85274b", 
            video: "assets/videos/student-11.mp4", 
            subOriginal: "🇰🇷 \"구아칠은 항상 선생님들을 응원합니다, 파이팅!", 
            subEn: "9A7 always supports our teachers, Fighting!", 
            subVi: "9A7 luôn luôn cổ vũ và đồng hành cùng các thầy cô, cố lên ạ!" 
        },
        { 
            id: 12, name: "Gia Huy", bgColor: "#B08D8D", textColor: "#845151", 
            video: "assets/videos/student-12.mp4", 
            subOriginal: "🇻🇳 \"9A7 có thể ngông ngạo, nhưng trước sự tận tụy của thầy cô, chúng em luôn cúi đầu kính trọng!\"", 
            subEn: "9A7 may be rebellious, but before our teachers' dedication, we always bow with respect!", 
            subVi: "" 
        },
        { 
            id: 13, name: "Thảo Nguyên", bgColor: "#3B2F2F", textColor: "#3B2F2F", 
            video: "assets/videos/student-13.mp4", 
            subOriginal: "🇰🇷 \"구아칠은 선생님들이 계셔서 항상 자신 있어요, 감사합니다!", 
            subEn: "Because 9A7 has our teachers, we are always confident. Thank you so much!", 
            subVi: "Vì có thầy cô bên cạnh, 9A7 luôn tự tin vững bước. Em cảm ơn thầy cô ạ!" 
        },
        { 
            id: 14, name: "Minh Quân", bgColor: "#022729", textColor: "#022729", 
            video: "assets/videos/student-14.mp4", 
            subOriginal: "🇻🇳 \"9A7 gửi trọn lòng biết ơn chân thành nhất đến toàn thể các thầy cô giáo ạ!\"", 
            subEn: "9A7 sends our deepest and most sincere gratitude to all beloved teachers!", 
            subVi: "" 
        },
        { 
            id: 15, name: "Bảo Ngọc", bgColor: "#752f39", textColor: "#752f39", 
            video: "assets/videos/student-15.mp4", 
            subOriginal: "🇪🇸 \"¡Muchas gracias, 9A7 te ama!", 
            subEn: "Thank you so much, 9A7 loves you!", 
            subVi: "Cảm ơn thầy cô rất nhiều, 9A7 luôn yêu thầy cô!" 
        },
        { 
            id: 16, name: "Bảo Khang", bgColor: "#ff82d5", textColor: "#bf3490", 
            video: "assets/videos/student-16.mp4", 
            subOriginal: "🇻🇳 \"Hôm nay 9A7 xin hứa sẽ thật ngoan để thầy cô có một ngày 20/11 trọn vẹn niềm vui!\"", 
            subEn: "Today 9A7 promises to be good so teachers can enjoy a joyful 20/11!", 
            subVi: "" 
        },
        { 
            id: 17, name: "Hùng Phong", bgColor: "#00674F", textColor: "#00674F", 
            video: "assets/videos/student-17.mp4", 
            subOriginal: "🇬🇧 \"We may not be the quietest class, but our gratitude is 100% real. Thank you for making 9A7 feel like home.🇯🇵 \"先生方、いつもありがとうございます！", 
            subEn: "We may not be the quietest class, but our gratitude is 100% real. Thank you for making 9A7 feel like home.", 
            subVi: "9A7 có thể không phải lớp trật tự nhất, nhưng lòng biết ơn là 100% chân thành. Cảm ơn thầy cô đã biến 9A7 thành mái nhà!" 
        },
        { 
            id: 18, name: "Minh Phúc", bgColor: "#D39E82", textColor: "#8d573a", 
            video: "assets/videos/student-18.mp4", 
            subOriginal: "🇻🇳 \"Cảm ơn thầy cô vì đã luôn bao dung cho những trò nghịch ngợm của 9A7!\"", 
            subEn: "Thank you teachers for always forgiving 9A7's playful misbehaviors!", 
            subVi: "" 
        },
        { 
            id: 19, name: "Thủy Tiên", bgColor: "#7a5a4d", textColor: "#7a5a4d", 
            video: "assets/videos/student-19.mp4", 
            subOriginal: "🇮🇹 \"Buona Festa degli Insegnanti da 9A7!", 
            subEn: "Happy Teacher's Day from 9A7!", 
            subVi: "Chúc mừng Ngày Nhà giáo Việt Nam từ tập thể lớp 9A7!" 
        },
        { 
            id: 20, name: "Diệu Anh", bgColor: "#fef2dc", textColor: "#e1cba1", 
            video: "assets/videos/student-20.mp4", 
            subOriginal: "🇻🇳 \"Em chúc các thầy cô luôn nhiều sức khỏe và niềm vui cùng 9A7 ạ!\"", 
            subEn: "Wishing our teachers endless health and joy alongside 9A7!", 
            subVi: "" 
        },
        { 
            id: 21, name: "Thạch Minh", bgColor: "#475569", textColor: "#475569", 
            video: "assets/videos/student-21.mp4", 
            subOriginal: "Happy Teacher's Day to all of our dedicated teachers!",
            subEn: "", 
            subVi: "Cảm ơn thầy cô vì đã luôn hỗ trợ 9A7. Chúc các thầy cô một ngày lễ Nhà giáo thật hạnh phúc!" 
        },
        { 
            id: 22, name: "Nguyên Phúc", bgColor: "#E8C5C8", textColor: "#8d5459", 
            video: "assets/videos/student-22.mp4", 
            subOriginal: "🇻🇳 \"Chúc các thầy cô luôn bình an, hạnh phúc và có nhiều kỷ niệm đẹp cùng 9A7!\"", 
            subEn: "Wishing our teachers peace, happiness, and beautiful memories with 9A7!", 
            subVi: "" 
        },
        { 
            id: 23, name: "Khánh Vân", bgColor: "#fec8d5", textColor: "#7d3a4a", 
            video: "assets/videos/student-23.mp4", 
            subOriginal: "🇬🇧 \"Wishing all teachers a joyful and beautiful day from 9A7!", 
            subEn: "", 
            subVi: "Chúc tất cả các thầy cô có một ngày lễ rực rỡ và ngập tràn niềm vui từ 9A7!" 
        },
        { 
            id: 24, name: "Băng Dương", bgColor: "#fef2dc", textColor: "#bd9a5b", 
            video: "assets/videos/student-24.mp4", 
            subOriginal: "🇻🇳 \"Lời nhắc nhở của thầy cô hôm nay chính là bài học giúp 9A7 trưởng thành hơn mai sau!\"", 
            subEn: "Teachers' reminders today are valuable lessons helping 9A7 grow tomorrow!", 
            subVi: "" 
        },
        { 
            id: 25, name: "Linh Đan", bgColor: "#9799BA", textColor: "#727499", 
            video: "assets/videos/student-25.mp4", 
            subOriginal: "🇻🇳 \"Tình cảm và sự kiên nhẫn thầy cô dành cho 9A7 chính là tác phẩm đẹp nhất!\"", 
            subEn: "The love and patience teachers give to 9A7 is the most beautiful masterpiece!", 
            subVi: "" 
        },
        { 
            id: 26, name: "Tuấn Bách", bgColor: "#4A000A", textColor: "#4A000A", 
            video: "assets/videos/student-26.mp4", 
            subOriginal: "🇻🇳 \"Kính chúc toàn thể các thầy cô luôn nhiều năng lượng và luôn mỉm cười cùng 9A7!\"", 
            subEn: "Wishing all teachers high energy and bright smiles with 9A7!", 
            subVi: "" 
        },
        { 
            id: 27, name: "Bảo Hoàng", bgColor: "#990000", textColor: "#990000", 
            video: "assets/videos/student-27.mp4", 
            subOriginal: "🇻🇳 \"Cảm ơn thầy cô đã luôn đồng hành và chắp cánh cho những ước mơ của 9A7!\"", 
            subEn: "Thank you teachers for always walking alongside and nurturing 9A7's dreams!", 
            subVi: "" 
        },
        { 
            id: 28, name: "Bảo Trâm", bgColor: "#e0f2fe", textColor: "#385d76", 
            video: "assets/videos/student-28.mp4", 
            subOriginal: "🇻🇳 \"Kính chúc các thầy cô luôn rạng rỡ và có một mùa Nhà giáo thật ý nghĩa cùng 9A7!\"", 
            subEn: "Wishing teachers to always shine bright and have a meaningful Teacher's Day with 9A7!", 
            subVi: "" 
        },
        { 
            id: 29, name: "Tuệ Anh", bgColor: "#92afcd", textColor: "#557699", 
            video: "assets/videos/student-29.mp4", 
            subOriginal: "🇰🇷 \"선생님, 구아칠의 예쁜 모습 항상 기억해 주세요! 사랑합니다!", 
            subEn: "Teachers, please always remember the beautiful moments of 9A7! We love you!", 
            subVi: "Thầy cô ơi, xin hãy luôn nhớ về những hình ảnh đẹp đẽ của 9A7 nhé! Chúng em yêu thầy cô!" 
        },
        { 
            id: 30, 
            name: "Tập thể 9A7", 
            bgColor: "#4d4d4d", 
            textColor: "#000000", 
            video: "assets/images/class-typography.png", // Đường dẫn file ảnh typography vừa tạo
            subOriginal: "🇬🇧 \"Thank you for creating an unforgettable youth for 9A7. Wherever we go, we will always be one family!\"", 
            subEn: "", 
            subVi: "Cảm ơn Thầy Cô vì đã dệt nên một thanh xuân rực rỡ cho 9A7. Dù mai này tung cánh muôn phương, chúng ta vẫn mãi là một gia đình!" 
        }
    ];

    // Tự động tạo mẫu cho các bạn từ 8 đến 28 (nếu chưa nhập thủ công)
    const defaultColors = [
        { bg: "#2F80ED", text: "#FFFFFF" }, { bg: "#10B981", text: "#D4FF24" },
        { bg: "#8B5CF6", text: "#F3E8FF" }, { bg: "#EC4899", text: "#FFFFFF" },
        { bg: "#F59E0B", text: "#78350F" }, { bg: "#06B6D4", text: "#ECFEFF" }
    ];

    for (let i = studentsConfig.length + 1; i <= 28; i++) {
        const colorPair = defaultColors[(i - 8) % defaultColors.length];
        studentsConfig.push({
            id: i,
            name: `Học Sinh ${i < 10 ? '0' + i : i}`,
            bgColor: colorPair.bg,
            textColor: colorPair.text,
            video: `assets/videos/student-${i}.mp4`,
            subOriginal: "Gửi trọn tình yêu thương và lòng biết ơn chân thành nhất tới thầy cô!",
            subEn: "Sending all our love and gratitude to our beloved teachers!",
            subVi: ""
        });
    }

    const sec4Section = document.getElementById("section-4");
    const gridContainer = document.getElementById("students-grid");
    const titleSec4 = document.getElementById("sec4-main-title");
    const subTitleSec4 = document.getElementById("sec4-sub-title");

    if (gridContainer) {
        gridContainer.innerHTML = "";

        studentsConfig.forEach((st) => {
            const card = document.createElement("div");
            card.className = "student-card";
            card.style.borderColor = st.textColor;

            // 1. Kiểm tra file là ảnh (.png, .jpg, .jpeg, .webp) hay video (.mp4...)
            const isImage = st.video.endsWith(".png") || st.video.endsWith(".jpg") || st.video.endsWith(".jpeg") || st.video.endsWith(".webp");

            // 2. Tạo thẻ HTML tương ứng cho Media (Ảnh hoặc Video)
            const mediaTag = isImage 
                ? `<img src="${st.video}" alt="${st.name}" style="width:100%; height:auto; max-height:48vh; object-fit:contain; border-radius:16px;">`
                : `<video src="${st.video}" controls playsinline preload="metadata" style="width:100%; max-height:48vh; object-fit:cover; border-radius:16px;"></video>`;

            // 3. Render giao diện Card
            card.innerHTML = `
                <!-- Nút Mũi tên góc trái trên (Chỉ hiển thị khi mở rộng) -->
                <button class="btn-card-back" title="Quay lại" style="display: none;">←</button>
                
                <div class="student-avatar-circle" style="background: ${st.textColor};">🎓</div>
                <h3 class="student-short-name" style="color: ${st.textColor};">${st.name}</h3>
                
                <div class="student-details">
                    <div class="student-video-container" style="background: transparent;">
                        ${mediaTag}
                    </div>
                    <div class="subtitle-box">
                        ${st.subOriginal ? `<p class="sub-line sub-original" style="color: ${st.textColor};">${st.subOriginal}</p>` : ''}
                        ${st.subEn ? `<p class="sub-line sub-en" style="color: ${st.textColor};">🇬🇧 ${st.subEn}</p>` : ''}
                        ${st.subVi ? `<p class="sub-line sub-vi" style="color: ${st.textColor};">🇻🇳 ${st.subVi}</p>` : ''}
                    </div>
                </div>
            `;

            const backBtn = card.querySelector(".btn-card-back");

            // SK MỞ THẺ
            card.addEventListener("click", function (e) {
                if (e.target.classList.contains("btn-card-back") || e.target.tagName === "VIDEO" || this.classList.contains("card-expanded")) return;

                document.querySelectorAll(".student-card").forEach(c => {
                    if (c === this) {
                        c.classList.add("card-expanded");
                        c.classList.remove("card-hidden");
                        const b = c.querySelector(".btn-card-back");
                        if (b) b.style.display = "flex";
                    } else {
                        c.classList.add("card-hidden");
                        c.classList.remove("card-expanded");
                    }
                });

                if (sec4Section) sec4Section.style.backgroundColor = st.bgColor;

                if (titleSec4) titleSec4.classList.add("hidden-title");
                if (subTitleSec4) subTitleSec4.classList.add("hidden-title");

                const currentVid = this.querySelector("video");
                if (currentVid) currentVid.play().catch(() => {});

                // Khi bấm Quay lại (backBtn):
                const v = c.querySelector("video");
                if (v) v.pause();
            });

            // SK NÚT QUAY LẠI TRONG Ô TRẮNG
            if (backBtn) {
                backBtn.addEventListener("click", function (e) {
                    e.stopPropagation();

                    document.querySelectorAll(".student-card").forEach(c => {
                        c.classList.remove("card-expanded");
                        c.classList.remove("card-hidden");
                        const b = c.querySelector(".btn-card-back");
                        if (b) b.style.display = "none";
                        const v = c.querySelector("video");
                        if (v) v.pause();
                    });

                    if (sec4Section) sec4Section.style.backgroundColor = "#F4EFEA";

                    if (titleSec4) {
                        titleSec4.classList.remove("hidden-title");
                        titleSec4.style.color = "#520108";
                    }
                    if (subTitleSec4) {
                        subTitleSec4.classList.remove("hidden-title");
                        subTitleSec4.style.color = "#666666";
                    }
                });
            }

            gridContainer.appendChild(card);
        });
    }
    // ==========================================
    // SECTION 5: XỬ LÝ RÚT THẺ THỬ THÁCH VUI & END SCREEN
    // ==========================================
    const challengesList = [
        "Thầy Cô hãy chọn ra 1 bạn quậy nhất 9A7 và lên chụp chung 1 kiểu ảnh tạo dáng bá đạo!",
        "Thầy Cô hãy yêu cầu tập thể 9A7 thực hiện 1 điều ước ngay lập tức ạ!",
        "Cả lớp 9A7 sẽ cùng thả tim và hô to 'Chúng em yêu cô!' trong 5 giây cho cô quay clip!",
        "Thầy Cô hãy chọn 3 bạn bất kỳ lên hát tặng cô một đoạn trong bài hát cô thích nhất!",
        "Thầy Cô hãy chọn 1 bạn nhảy giỏi nhất lớp lên hướng dẫn cô thực hiện 1 động tác 'trend' cực chill!",
        "Thầy Cô hãy cùng lớp tạo dáng 'thả tim' để chụp một bức ảnh kỷ niệm để đời!",
        "Cả lớp 9A7 xin phép được tặng cô một tràng vỗ tay kéo dài liên tục 15 giây thật nồng nhiệt!",
        "Thầy Cô hãy chỉ định 2 bạn bất kỳ lên bóp vai và massage tay cho cô trong 3 phút!",
        "Thầy Cô hãy kể lại một kỷ niệm đáng yêu hoặc buồn cười nhất mà cô nhớ về 9A7!",
        "Đặc quyền gọi tên 1 bạn học sinh bất kỳ lên phát biểu cảm nghĩ về cô trong 30 giây!",
        "Thầy Cô hãy chọn ra bạn có nụ cười rực rỡ nhất lớp và chụp chung một tấm hình kỷ niệm!",
        "Thầy Cô hãy yêu cầu 1 học sinh hát 1 bài bất kỳ để khuấy động không khí!",
        "Mời cô chỉ định 2 bạn lên làm tư thế ghép hình trái tim lớn để cô đứng ở giữa chụp ảnh!",
        "Thầy Cô hãy chọn ra bạn học sinh mà cô thấy có nhiều tiến bộ nhất để khen ngợi trước lớp!",
        "Cả lớp 9A7 sẽ đồng thanh gửi đến cô một lời hứa quyết tâm thi đạt kết quả cao nhất!",
        "Thầy Cô hãy chọn một bạn có giọng nói ấm áp nhất lên gửi lời chúc sức khỏe đến cô và gia đình!",
        "Mời cô chụp một bức ảnh 'selfie góc rộng' cùng toàn bộ thành viên 9A7!",
        "Thầy Cô hãy chọn ra bạn có nét tính cách giống cô nhất khi còn đi học!",
        "Thầy Cô hãy nhận 3 điều ước nhỏ từ 3 bạn học sinh ngồi ở 3 dãy khác nhau!",
        "Mời cô chọn 1 bạn có chiều cao ấn tượng nhất lớp để chụp ảnh so sánh chiều cao vui vẻ!",
        "Thầy Cô được nhận một bản nhạc nhẹ nhàng do 1 bạn trong lớp mở/thể hiện tặng cô!",
        "Thầy Cô hãy chỉ định 2 bạn vui tính nhất lớp lên làm trò hề hoặc diễn hài ngắn cho cô cười!",
        "Cả lớp sẽ cùng hô to câu: 'Thầy Cô là người tuyệt vời nhất trong lòng 9A7!'",
    ];

    const btnDraw = document.getElementById("btn-draw");
    const btnDrawAgain = document.getElementById("btn-draw-again");
    const jarWrapper = document.querySelector(".jar-wrapper");
    const gachaBox = document.getElementById("gacha-box");
    const gachaResult = document.getElementById("gacha-result");
    const challengeText = document.getElementById("challenge-text");
    const btnToEndscreen = document.getElementById("btn-to-endscreen");
    const endScreen = document.getElementById("end-screen");

    let remainingChallenges = [...challengesList];

    function drawRandomChallenge() {
        if (remainingChallenges.length === 0) {
            remainingChallenges = [...challengesList]; // Reset mảng nếu rút hết
        }

        // Rung lắc hũ thủy tinh
        if (jarWrapper) jarWrapper.classList.add("shake");
        if (btnDraw) btnDraw.disabled = true;

        setTimeout(() => {
            if (jarWrapper) jarWrapper.classList.remove("shake");

            const randomIndex = Math.floor(Math.random() * remainingChallenges.length);
            const selected = remainingChallenges.splice(randomIndex, 1)[0];

            if (challengeText) challengeText.innerText = `"${selected}"`;

            if (gachaBox) gachaBox.style.display = "none";
            if (gachaResult) gachaResult.classList.remove("hidden-result");
            if (btnDraw) btnDraw.disabled = false;
        }, 800);
    }

    if (btnDraw) btnDraw.addEventListener("click", drawRandomChallenge);

    if (btnDrawAgain) {
        btnDrawAgain.addEventListener("click", function () {
            if (gachaResult) gachaResult.classList.add("hidden-result");
            if (gachaBox) gachaBox.style.display = "block";
            drawRandomChallenge();
        });
    }

    // Hiển thị Màn hình Kết
    if (btnToEndscreen && endScreen) {
        btnToEndscreen.addEventListener("click", function () {
            endScreen.classList.remove("hidden-screen");
        });
    }

    // Nút Quay lại từ Màn hình Kết về giao diện Bốc thăm
    const btnBackFromEnd = document.getElementById("btn-back-from-endscreen");
    if (btnBackFromEnd && endScreen) {
        btnBackFromEnd.addEventListener("click", function () {
            endScreen.classList.add("hidden-screen");
        });
    }
});
