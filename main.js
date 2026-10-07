(() => {
  const root = document.documentElement;

  // Paint configurator works with or without GSAP.
  const swatches = document.querySelectorAll(".swatch");
  const swatchName = document.querySelector(".swatch-name");
  swatches.forEach((btn) => {
    btn.addEventListener("click", () => {
      swatches.forEach((s) => {
        s.classList.toggle("active", s === btn);
        s.setAttribute("aria-checked", s === btn);
      });
      root.style.setProperty("--car", btn.dataset.car);
      root.style.setProperty("--car-hi", btn.dataset.hi);
      root.style.setProperty("--accent", btn.dataset.accent);
      swatchName.textContent = btn.getAttribute("aria-label");
      if (window.gsap) {
        gsap.fromTo(".build-car", { y: -14, scale: 0.97 }, { y: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.5)" });
        gsap.fromTo(".turntable", { scale: 0.9, opacity: 1 }, { scale: 1, opacity: 0.4, duration: 0.8, ease: "power2.out" });
      }
    });
  });

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.add("no-motion");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const spin = (el, deg) => el && el.style.setProperty("--spin", `${deg}deg`);
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Scroll progress bar
    gsap.to(".progress span", {
      scaleX: 1, ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });

    // ---- Hero intro ----
    const heroCar = document.querySelector(".hero-car");
    const wheelState = { deg: 0 };
    const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .from(".hero-title span", { yPercent: 120, opacity: 0, rotateX: -80, stagger: 0.08, duration: 1.4 })
      .from(".hero-line", { y: 30, opacity: 0, stagger: 0.12, duration: 1 }, "-=1")
      .from(heroCar, { xPercent: -130, duration: 1.8, ease: "power4.out" }, "-=1.2")
      .to(wheelState, { deg: 1080, duration: 1.8, ease: "power4.out", onUpdate: () => spin(heroCar, wheelState.deg) }, "<");

    // Hero scroll-out: title lifts, car rolls forward and zooms
    gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    })
      .to(".hero-title", { yPercent: -60, opacity: 0, letterSpacing: "0.4em", ease: "none" }, 0)
      .to(".hero-sub, .scroll-hint, .eyebrow.hero-line", { y: -80, opacity: 0, ease: "none" }, 0)
      .to(heroCar, { x: () => window.innerWidth * 0.5, scale: 1.3, ease: "power1.in",
        onUpdate() { spin(heroCar, 1080 + this.progress() * 900); } }, 0)
      .to(".hero-glow", { scale: 1.6, opacity: 0, ease: "none" }, 0);

    // ---- Pinned drive sequence ----
    const driveCar = document.querySelector(".drive-car");
    const speedo = document.querySelector(".speedo-val");
    const steps = gsap.utils.toArray(".drive-step");
    const maxSpeed = 412;

    const drive = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".drive",
        start: "top top",
        end: "+=300%",
        pin: ".drive-stage",
        scrub: 0.8,
        onUpdate(self) {
          const p = self.progress;
          speedo.textContent = Math.round(Math.pow(p, 1.6) * maxSpeed);
          spin(driveCar, p * 6000);
        },
      },
    });

    drive
      .fromTo(driveCar, { xPercent: -140 }, { xPercent: 0, duration: 1, ease: "power2.out" })
      .to(steps[0], { opacity: 1, y: 0, duration: 0.3 }, 0.3)
      .to(steps[0], { opacity: 0, y: -40, duration: 0.3 }, 1.1)
      .to(driveCar, { scale: 1.08, y: -6, duration: 0.6 }, 1.1)
      .to(".speed-lines", { opacity: 0.6, duration: 0.6 }, 1.1)
      .fromTo(steps[1], { y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, 1.3)
      .to(".drive-road", { backgroundPositionX: "-2400px", duration: 2.2 }, 1.1)
      .to(steps[1], { opacity: 0, y: -40, duration: 0.3 }, 2)
      .fromTo(steps[2], { y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, 2.2)
      .to(".speed-lines", { opacity: 1, backgroundPositionY: "200px", duration: 1 }, 2.2)
      .to(driveCar, { xPercent: 200, scale: 0.9, skewX: -8, duration: 0.9, ease: "power3.in" }, 2.6);

    // ---- Horizontal tech scroller ----
    const track = document.querySelector(".tech-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    const horiz = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".tech",
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    gsap.utils.toArray(".tech-card").forEach((card) => {
      gsap.from(card, {
        y: 120, rotate: 6, opacity: 0, ease: "power2.out",
        scrollTrigger: { trigger: card, containerAnimation: horiz, start: "left 95%", end: "left 60%", scrub: true },
      });
    });

    // ---- Generic reveals ----
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 60, opacity: 0, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // ---- Stat counters ----
    gsap.utils.toArray(".stat-num").forEach((el) => {
      const to = parseFloat(el.dataset.to);
      const dec = parseInt(el.dataset.dec || "0", 10);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: to, duration: 2.2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
        onUpdate: () => {
          el.textContent = dec ? obj.v.toFixed(dec) : Math.round(obj.v).toLocaleString();
        },
      });
    });

    // ---- Configurator car slides in ----
    const buildCar = document.querySelector(".build-car");
    gsap.fromTo(buildCar, { xPercent: 60, opacity: 0 }, {
      xPercent: 0, opacity: 1, ease: "power2.out",
      scrollTrigger: {
        trigger: ".build", start: "top 80%", end: "center center", scrub: 1,
        onUpdate(self) { spin(buildCar, (1 - self.progress) * -720); },
      },
    });
    gsap.from(".turntable", {
      scaleX: 0, ease: "none",
      scrollTrigger: { trigger: ".build", start: "top 70%", end: "center center", scrub: true },
    });

    // ---- Reserve title zoom ----
    gsap.from(".reserve-title", {
      scale: 0.6, opacity: 0, letterSpacing: "0.5em", ease: "none",
      scrollTrigger: { trigger: ".reserve", start: "top bottom", end: "center center", scrub: true },
    });
  });

  // Reduced motion: no pinning or scrubbing, everything visible and static.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    root.classList.add("no-motion");
    document.querySelectorAll(".stat-num").forEach((el) => {
      const dec = parseInt(el.dataset.dec || "0", 10);
      el.textContent = dec ? parseFloat(el.dataset.to).toFixed(dec) : Number(el.dataset.to).toLocaleString();
    });
    document.querySelector(".speedo-val").textContent = "412";
  });
})();
