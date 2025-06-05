// import { Injectable, NgZone } from '@angular/core';
// import { Router } from '@angular/router';

// // Declare SpeechRecognition globally
// declare var webkitSpeechRecognition: any;

// @Injectable({
//   providedIn: 'root'
// })
// export class SpeechRecognitionService {
//   recognition: any;

//   constructor(private router: Router, private ngZone: NgZone) {
//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

//     if (SpeechRecognition) {
//       this.recognition = new SpeechRecognition();
//       this.recognition.continuous = true;
//       this.recognition.lang = 'en-US';
//       this.recognition.interimResults = false;

//       this.recognition.onresult = (event: any) => this.handleResult(event);
//       this.recognition.onerror = (event: any) => console.error('Speech recognition error:', event);
//       this.recognition.onend = () => this.restartRecognition(); // Restart automatically

//       this.startListening(); // Auto-start voice recognition
//     } else {
//       console.warn('Speech Recognition is not supported in this browser.');
//     }
//   }

//   startListening() {
//     this.recognition.start();
//   }

//   stopListening() {
//     this.recognition.stop();
//   }

//   private restartRecognition() {
//     setTimeout(() => this.recognition.start(), 1000); // Restart after a delay
//   }

//   private handleResult(event: any) {
//     const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
//     console.log('Recognized:', transcript);
//     this.processCommand(transcript);
//   }

//   private processCommand(command: string) {
//     const commandsMap: { [key: string]: string } = {
//       'open home': '/home',
//       'open about us': '/about-us',
//       'open contact us': '/contact-us',
//       'sign in': '/signin',
//       'sign up': '/sign-up',
//       'forgot password': '/forgot-password',
//       'search properties': '/search-properties',
//       'view property': '/view-property/1', // Example property ID
//       'open dashboard': '/dashboard',
//       'open profile': '/dashboard/profile',
//       'open membership details': '/dashboard/membership-details',
//       'add property': '/dashboard/addpropertysample',
//       'view reviews': '/view-reviews',
//       'user dashboard': '/UserDashboard',
//       'user profile': '/UserDashboard/profile',
//       'user add property': '/UserDashboard/UserAddProperty',
//     };

//     if (commandsMap[command]) {
//       console.log(`Navigating to: ${commandsMap[command]}`);
//       this.ngZone.run(() => this.router.navigate([commandsMap[command]]));
//     } else {
//       console.log('Command not recognized:', command);
//     }
//   }
// }
