import { Component, Input, ViewChild, ElementRef, HostListener, OnInit, OnDestroy, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-auth-illustration',
  templateUrl: './auth-illustration.component.html',
  styleUrls: ['./auth-illustration.component.scss']
})
export class AuthIllustrationComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() isTyping = false;
  @Input() isLookingAtEachOther = false;
  @Input() isPurplePeeking = false;
  @Input() hasPassword = false;
  @Input() hidePassword = true;

  @ViewChild('purpleRef') purpleRef!: ElementRef<HTMLDivElement>;
  @ViewChild('blackRef') blackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('yellowRef') yellowRef!: ElementRef<HTMLDivElement>;
  @ViewChild('orangeRef') orangeRef!: ElementRef<HTMLDivElement>;

  mouseX = window.innerWidth / 2;
  mouseY = window.innerHeight / 2;

  isPurpleBlinking = false;
  isBlackBlinking = false;

  private purpleBlinkTimeout: any;
  private blackBlinkTimeout: any;

  // Cached Positions
  purplePos = { faceX: 0, faceY: 0, bodySkew: 0 };
  blackPos = { faceX: 0, faceY: 0, bodySkew: 0 };
  yellowPos = { faceX: 0, faceY: 0, bodySkew: 0 };
  orangePos = { faceX: 0, faceY: 0, bodySkew: 0 };

  purplePupilPos = { x: 0, y: 0 };
  blackPupilPos = { x: 0, y: 0 };
  orangePupilPos = { x: 0, y: 0 };
  yellowPupilPos = { x: 0, y: 0 };

  ngOnInit() {
    this.schedulePurpleBlink();
    this.scheduleBlackBlink();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.mouseX = window.innerWidth / 2;
      this.mouseY = window.innerHeight / 2;
      this.updatePositions();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updatePositions();
  }

  ngOnDestroy() {
    clearTimeout(this.purpleBlinkTimeout);
    clearTimeout(this.blackBlinkTimeout);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.updatePositions();
  }

  private schedulePurpleBlink() {
    const interval = Math.random() * 4000 + 3000;
    this.purpleBlinkTimeout = setTimeout(() => {
      this.isPurpleBlinking = true;
      setTimeout(() => {
        this.isPurpleBlinking = false;
        this.schedulePurpleBlink();
      }, 150);
    }, interval);
  }

  private scheduleBlackBlink() {
    const interval = Math.random() * 4000 + 3000;
    this.blackBlinkTimeout = setTimeout(() => {
      this.isBlackBlinking = true;
      setTimeout(() => {
        this.isBlackBlinking = false;
        this.scheduleBlackBlink();
      }, 150);
    }, interval);
  }

  calculatePosition(ref: ElementRef<HTMLDivElement> | undefined) {
    if (!ref || !ref.nativeElement) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = this.mouseX - centerX;
    const deltaY = this.mouseY - centerY;
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
    return { faceX, faceY, bodySkew };
  }

  calculatePupilPosition(ref: ElementRef<HTMLDivElement> | undefined, maxDistance: number, forceLookX?: number, forceLookY?: number) {
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    if (!ref || !ref.nativeElement) return { x: 0, y: 0 };
    const rect = ref.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = this.mouseX - centerX;
    const deltaY = this.mouseY - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    return { x, y };
  }

  updatePositions() {
    this.purplePos = this.calculatePosition(this.purpleRef);
    this.blackPos = this.calculatePosition(this.blackRef);
    this.yellowPos = this.calculatePosition(this.yellowRef);
    this.orangePos = this.calculatePosition(this.orangeRef);

    const forcePurpleX = (this.hasPassword && !this.hidePassword) ? (this.isPurplePeeking ? 4 : -4) : this.isLookingAtEachOther ? 3 : undefined;
    const forcePurpleY = (this.hasPassword && !this.hidePassword) ? (this.isPurplePeeking ? 5 : -4) : this.isLookingAtEachOther ? 4 : undefined;
    this.purplePupilPos = this.calculatePupilPosition(this.purpleRef, 5, forcePurpleX, forcePurpleY);

    const forceBlackX = (this.hasPassword && !this.hidePassword) ? -4 : this.isLookingAtEachOther ? 0 : undefined;
    const forceBlackY = (this.hasPassword && !this.hidePassword) ? -4 : this.isLookingAtEachOther ? -4 : undefined;
    this.blackPupilPos = this.calculatePupilPosition(this.blackRef, 4, forceBlackX, forceBlackY);

    const forceOrangeX = (this.hasPassword && !this.hidePassword) ? -5 : undefined;
    const forceOrangeY = (this.hasPassword && !this.hidePassword) ? -4 : undefined;
    this.orangePupilPos = this.calculatePupilPosition(this.orangeRef, 5, forceOrangeX, forceOrangeY);

    const forceYellowX = (this.hasPassword && !this.hidePassword) ? -5 : undefined;
    const forceYellowY = (this.hasPassword && !this.hidePassword) ? -4 : undefined;
    this.yellowPupilPos = this.calculatePupilPosition(this.yellowRef, 5, forceYellowX, forceYellowY);
  }
}
