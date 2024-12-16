import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillModule,QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-add-property-component',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,HttpClientModule,NgClass,QuillModule,NgIf,NgFor],
  templateUrl: './add-property-component.component.html',
  styleUrl: './add-property-component.component.css'
})
export class AddPropertyComponentComponent implements OnInit {
  isModalOpen: any;
  isVideoModalOpen:any;
  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;

  constructor(public http:HttpClient,private cdRef: ChangeDetectorRef){}
  ngOnInit(): void {
    this.propertyform.get('TotalArea')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.propertyform.get('PriceFor')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.fetchProperties();
  }

  generatePropertyID(){
    this.http.get("https://localhost:7190/api/Users/getautopropertyID", { responseType: 'text' }).subscribe((response: string) => {
      this.propID = response;
      this.propertyform.patchValue({ id: response });
      console.log('Generated Property ID:', response);
    }, error => {
      console.error('Error fetching property ID:', error);
    });
  }

  fetchProperties(): void {
    this.http.get('https://localhost:7190/api/Users/GetAllPropertyDetails')
    .subscribe((response: any) => {
      // Map the response to extract only the propID, propname, and developedby fields
      this.properties = response.map((property: any) => ({
        propID: property.propID,
        propname: property.propname,  // Adjust field names if necessary
        developedby: property.developedby
      }));

      console.log('Mapped properties:', this.properties);
    }, error => {
      console.error('Error fetching properties:', error);
    });
  }

  propertyform: FormGroup = new FormGroup({
    id: new FormControl(),
    PropertyTitle: new FormControl(),
    DevelopedBy: new FormControl(),
    MobileNumber:new FormControl(),
    EmailID:new FormControl(),
    Address:new FormControl(),
    LandMark:new FormControl(),
    Country:new FormControl(),
    State:new FormControl(),
    City:new FormControl(),
    NearBy:new FormControl(),
    PostalCode:new FormControl(),
    CertificateNumber:new FormControl(),
    PropertyApprovedBy:new FormControl(),
    PropertyType:new FormControl(),
    PropertyFor:new FormControl(),
    PropertyStatus:new FormControl(),
    PropertyFacing:new FormControl(),
    TotalBlocks:new FormControl(),
    TotalFloors:new FormControl(),
    TotalNoOfFlats:new FormControl(),
    BlockName:new FormControl(),
    PropertyOnWhichFloor:new FormControl(),
    NumberofBedrooms:new FormControl(),
    NumberofBathrooms:new FormControl(),
    NumberofBalconies:new FormControl(),
    NumberofParkings:new FormControl(),
    AreaType:new FormControl(),
    TotalArea:new FormControl('', [Validators.required, Validators.min(1)]),
    CarpetArea:new FormControl(),
    PriceFor:new FormControl('', [Validators.required, Validators.min(1)]),
    PropertyTotalPrice:new FormControl({ value: '', disabled: true }),
    AmenitiesCharges:new FormControl(),
    MaintenanceCharges:new FormControl(),
    CorpusFund:new FormControl(),
    BuildYear:new FormControl(),
    PossessionDate:new FormControl(),
    ListDate:new FormControl(),
    Description:new FormControl(),
    SpecificDescription:new FormControl(),

    WebsiteUrl:new FormControl(),
    Pinteresturl: new FormControl(),
    Facebookurl:new FormControl(),
    Twitterurl:new FormControl(),
    GoogleLocationurl:new FormControl(),
    AvailabilityOptions:new FormControl()
  });

  countries: any[] = [];
  states: any[] = [];
  cities:any[]=[];
  selectedCountry: number | null = null;
  selectedState: number | null = null;
  editclicked: boolean = false;
  addnewPropertyclicked:boolean=false;
  properties: Array<{ propID: string, propname: string, developedby: string }> = [];
  propertyInsStatus: any = '';
  aminities: Array<{ aminitieID: string, name: string, description: string }> = [];
  //propertyImages
  propID: string = '';
  selectedPropertyFiles: FileList | null = null;
  selectedPropertyFloorFiles: FileList | null = null;
  selectedPropertyVideoFiles: FileList | null = null;
  //uploadedImages1: Array<{ id: number, propID: string, fileName: string, mimeType: string, imageData: Blob, imageUrl: string }> = [];
  uploadedImages1: Array<{ 
    id: number, 
    propID: string, 
    fileName: string, 
    mimeType: string, 
    imageData: Blob, 
    imageUrl: string 
  }> = [];

  uploadedFloorImages1:Array<{ 
    id: number, 
    propID: string, 
    fileName: string, 
    mimeType: string, 
    imageData: Blob, 
    imageUrl: string 
  }> = [];

  uploadedVideos1:Array<{ 
    id: number, 
    propID: string, 
    fileName: string, 
    mimeType: string, 
    videoData: Blob, 
    videoUrl: string 
  }> = [];
  
  uploadedImages: Array<{ path: string }> = [];
  uploadedFloorImages:Array<{ path: string }> = [];
  uploadedVideos:Array<{ path: string }> = [];
  selectedImage: string = '';
  seletedVideo:string='';
  // selectedFloorImage:string = '';

  calculateTotalPrice(): void {
    const totalArea = this.propertyform.get('TotalArea')?.value;
    const priceFor = this.propertyform.get('PriceFor')?.value;

    if (totalArea && priceFor) {
      const totalPrice = totalArea * priceFor;
      this.propertyform.get('PropertyTotalPrice')?.setValue(totalPrice, { emitEvent: false });
    } else {
      this.propertyform.get('PropertyTotalPrice')?.setValue('', { emitEvent: false });
    }
  }

  loadCountries(): void {
    this.http.get<any[]>('https://localhost:7190/api/Users/Countries')
      .subscribe({
        next: (data) => {
          this.countries = data;
        },
        error: (err) => {
          console.error('Failed to load countries:', err);
        }
      });
  }


  loadStates(): void {
    if (this.selectedCountry) {
      this.http.get<any[]>(`https://localhost:7190/api/Users/States/${this.selectedCountry}`)
        .subscribe({
          next: (data) => {
            this.states = data; 
            console.log(data); 
          },
          error: (err) => {
            console.error('Failed to load states:', err);
          }
        });
    }
  }

  loadCities(): void {
    if (this.selectedState) {
      this.http.get<any[]>(`https://localhost:7190/api/Users/cities/${this.selectedState}`)
        .subscribe({
          next: (data) => {
            this.cities = data;  
            console.log(data);
          },
          error: (err) => {
            console.error('Failed to load cities:', err);
          }
        });
    }
  }


  onCountryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const countryId = selectElement.value;
      this.selectedCountry = Number(countryId);
      console.log('Selected Country ID:', this.selectedCountry);
      this.loadStates();  
    }
  }

  onStateChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const stateId = selectElement.value;
      this.selectedState = Number(stateId);
      this.loadCities();  
    }
  }

  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], 
      ['blockquote', 'code-block'], 
      [{ header: 1 }, { header: 2 }], 
      [{ list: 'ordered' }, { list: 'bullet' }], 
      [{ script: 'sub' }, { script: 'super' }], 
      [{ indent: '-1' }, { indent: '+1' }], 
      [{ direction: 'rtl' }], 
      [{ size: ['small', false, 'large', 'huge'] }], 
      [{ color: [] }, { background: [] }], 
      [{ font: [] }], 
      [{ align: [] }], 
      ['clean'] 
    ]
  };

  uploadPropertyImages(): void {
    console.log(this.propID);
    if (!this.propID || !this.selectedPropertyFiles || this.selectedPropertyFiles.length === 0) {
      alert('Property ID is required and you must select images.');
      return;
    }

    const formData = new FormData();
    formData.append('propID', this.propID);

    // Append each selected file to formData
    Array.from(this.selectedPropertyFiles).forEach((file: File) => {
      formData.append('images', file, file.name);
    });

    // Make HTTP request to upload the files
    this.http.post('https://localhost:7190/api/Users/upload', formData).subscribe(
      response => {
        console.log('Images uploaded successfully:', response);
        this.getPropertyImagesForProperty(this.propID);  // Refresh the images after upload
      },
      
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  uploadPropertyFloorImages(): void {
    console.log(this.propID);
    if (!this.propID || !this.selectedPropertyFloorFiles || this.selectedPropertyFloorFiles.length === 0) {
      alert('Property ID is required and you must select images.');
      return;
    }

    const formData = new FormData();
    formData.append('propID', this.propID);

    // Append each selected file to formData
    Array.from(this.selectedPropertyFloorFiles).forEach((file: File) => {
      formData.append('images', file, file.name);
    });

    // Make HTTP request to upload the files
    this.http.post('https://localhost:7190/api/Users/uploadFloorImages', formData).subscribe(
      response => {
        console.log('Floor Images uploaded successfully:', response);
        this.getPropertyFloorImagesForProperty(this.propID);  // Refresh the images after upload
      },
      
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  uploadPropertyVideos(): void {
    console.log(this.propID);
    if (!this.propID || !this.selectedPropertyVideoFiles || this.selectedPropertyVideoFiles.length === 0) {
      alert('Property ID is required and you must select video.');
      return;
    }

    const formData = new FormData();
    formData.append('propID', this.propID);

    // Append each selected file to formData
    Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
      formData.append('videos', file, file.name);
    });

    // Make HTTP request to upload the files
    this.http.post('https://localhost:7190/api/Users/uploadPropertyVideo', formData).subscribe(
      response => {
        console.log('Property Video uploaded successfully:', response);
        this.getPropertyVideo(this.propID);  // Refresh the images after upload
      },
      
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  getPropertyImagesForProperty(propID: string): void {
    this.http.get(`https://localhost:7190/api/Users/get-images/${propID}`).subscribe((response: any) => {
      // Process response and convert imageData to Blob URL
      this.uploadedImages1 = response.map((image: any) => {
        const byteCharacters = atob(image.imageData); // Decoding base64 to raw binary
        const byteArray = new Uint8Array(byteCharacters.length);

        // Copy the binary data into the byteArray
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        // Create a Blob from the byteArray
        const blob = new Blob([byteArray], { type: image.mimeType });

        // Create an object URL from the Blob
        const imageUrl = URL.createObjectURL(blob);
        console.log(imageUrl);
        return {
          ...image,
          propID: propID,
          imageUrl // Add the Blob URL to the image object
        };
      });

      console.log('Processed image array:', this.uploadedImages1);
    }, error => {
      console.error('Error fetching images:', error);
    });
  }

  getPropertyFloorImagesForProperty(propID: string): void {
    this.http.get(`https://localhost:7190/api/Users/get-Floorimages/${propID}`).subscribe((response: any) => {
      // Process response and convert imageData to Blob URL
      this.uploadedFloorImages1 = response.map((image: any) => {
        const byteCharacters = atob(image.imageData); // Decoding base64 to raw binary
        const byteArray = new Uint8Array(byteCharacters.length);

        // Copy the binary data into the byteArray
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        // Create a Blob from the byteArray
        const blob = new Blob([byteArray], { type: image.mimeType });

        // Create an object URL from the Blob
        const imageUrl = URL.createObjectURL(blob);
        console.log(imageUrl);
        return {
          ...image,
          propID: propID,
          imageUrl // Add the Blob URL to the image object
        };
      });

      console.log('Processed image array:', this.uploadedFloorImages1);
    }, error => {
      console.error('Error fetching images:', error);
    });
  }

  getPropertyVideo(propID: string): void {
    this.http.get(`https://localhost:7190/api/Users/get-PropertyVideo/${propID}`).subscribe((response: any) => {
      // Process response and convert imageData to Blob URL
      this.uploadedVideos1 = response.map((video: any) => {
        const byteCharacters = atob(video.imageData); // Decoding base64 to raw binary
        const byteArray = new Uint8Array(byteCharacters.length);

        // Copy the binary data into the byteArray
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        // Create a Blob from the byteArray
        const blob = new Blob([byteArray], { type: video.mimeType });

        // Create an object URL from the Blob
        const videosUrl = URL.createObjectURL(blob);
        console.log(videosUrl);
        return {
          ...video,
          propID: propID,
          videosUrl // Add the Blob URL to the image object
        };
      });

      console.log('Processed Video array:', this.uploadedVideos1);
    }, error => {
      console.error('Error fetching images:', error);
    });
  }

  deleteImage(image: any): void {
    const index = this.uploadedImages.indexOf(image);

    console.log(index);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1); // Remove image from table
    }
  }
  

  deleteImage1(propertyId: string, imageId: number): void {
    this.http.delete(`https://localhost:7190/api/Users/delete-image/${propertyId}/${imageId}`, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text' // Explicitly set the response type as 'text'
    }).subscribe({
      next: (response: string) => {
        console.log('Image deleted from database:', response);  // 'Image deleted successfully'
        
        // Now remove the image from the frontend list
        const index = this.uploadedImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
        if (index !== -1) {
          this.uploadedImages1.splice(index, 1); // Remove image from the UI list
        }
    
        // Optionally, refresh the image list from the server
        this.getPropertyImagesForProperty(this.propID);
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        console.log('Error response:', error.error);
      },
      complete: () => {
        console.log('Delete request completed');
      }
    });
    
    console.log(propertyId),
    console.log(imageId)
  }

  deleteFloorImage1(propertyId: string, imageId: number): void {
    this.http.delete(`https://localhost:7190/api/Users/delete-Floorimage/${propertyId}/${imageId}`, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text' // Explicitly set the response type as 'text'
    }).subscribe({
      next: (response: string) => {
        console.log('Image deleted from database:', response);  // 'Image deleted successfully'
        
        // Now remove the image from the frontend list
        const index = this.uploadedFloorImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
        if (index !== -1) {
          this.uploadedFloorImages1.splice(index, 1); // Remove image from the UI list
        }
    
        // Optionally, refresh the image list from the server
        this.getPropertyFloorImagesForProperty(this.propID);
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        console.log('Error response:', error.error);
      },
      complete: () => {
        console.log('Delete request completed');
      }
    });
    
    console.log(propertyId),
    console.log(imageId)
  }

  deleteVideo(propertyId: string, VideoId: number): void {
    this.http.delete(`https://localhost:7190/api/Users/delete-PropertyVideo/${propertyId}/${VideoId}`, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text' // Explicitly set the response type as 'text'
    }).subscribe({
      next: (response: string) => {
        console.log('Video deleted from database:', response);  // 'Image deleted successfully'
        
        // Now remove the image from the frontend list
        const index = this.uploadedVideos1.findIndex(video => video.id === VideoId && video.propID === propertyId);
        if (index !== -1) {
          this.uploadedVideos1.splice(index, 1); // Remove image from the UI list
        }
    
        // Optionally, refresh the image list from the server
        this.getPropertyVideo(this.propID);
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        console.log('Error response:', error.error);
      },
      complete: () => {
        console.log('Delete request completed');
      }
    });
  }


  

  openModal(imagePath: string): void {
    this.selectedImage = imagePath;  // Set the selected image path
    this.isModalOpen = true;  // Show the modal
  }

  openVideoModal(videoPath:string):void{
    this.seletedVideo=videoPath;
    this.isVideoModalOpen=true;
  }

  // Close the modal
  closeModal(): void {
    this.isModalOpen = false;  // Hide the modal
    this.selectedImage = '';  // Clear the selected image path
  }

  closeVideoModal(): void {
    this.isVideoModalOpen = false;  // Hide the modal
    this.seletedVideo = '';  // Clear the selected image path
  }

  clearContent(editorId: string): void {
    
    if (this.quillEditor) {
     
      this.quillEditor.quillEditor.setText('');

      this.propertyform.controls['Description'].setValue('');
      this.propertyform.get('SpecificDescription')?.setValue('');  
      const quillEditor = document.getElementById(editorId) as any;
      if (quillEditor && quillEditor.__quill) {
        quillEditor.__quill.root.innerHTML = '';  
      }
    }
  }

  onFileSelect(event: any): void {
    if (event?.target?.files) {
      this.selectedPropertyFiles = event.target.files;

      if (this.selectedPropertyFiles && this.selectedPropertyFiles.length > 0) {
        this.uploadedImages = [];  // Clear previous images

        // Convert FileList to an array and create image previews
        Array.from(this.selectedPropertyFiles).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Push the data URL (base64 string) into the uploadedImages array
            this.uploadedImages.push({ path: reader.result as string });
          };
          reader.readAsDataURL(file);  // Read file as data URL for preview
        });
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }

  onFloorFileSelect(event: any): void {
    if (event?.target?.files) {
      this.selectedPropertyFloorFiles = event.target.files;

      if (this.selectedPropertyFloorFiles && this.selectedPropertyFloorFiles.length > 0) {
        this.uploadedFloorImages = [];  // Clear previous images

        // Convert FileList to an array and create image previews
        Array.from(this.selectedPropertyFloorFiles).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Push the data URL (base64 string) into the uploadedImages array
            this.uploadedFloorImages.push({ path: reader.result as string });
          };
          reader.readAsDataURL(file);  // Read file as data URL for preview
        });
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }

  onVideoFileSelect(event: any): void {
    if (event?.target?.files) {
      this.selectedPropertyVideoFiles = event.target.files;

      if (this.selectedPropertyVideoFiles && this.selectedPropertyVideoFiles.length > 0) {
        this.uploadedVideos = [];  // Clear previous images

        // Convert FileList to an array and create image previews
        Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Push the data URL (base64 string) into the uploadedImages array
            this.uploadedVideos.push({ path: reader.result as string });
          };
          reader.readAsDataURL(file);  // Read file as data URL for preview
        });
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }

  SubmitPropertyClick(){

  }

  editproperty(propertyID: string): void {
    this.editclicked = true;
    this.propID = propertyID;  
    this.getTotalPropertyDet(propertyID);
    this.loadCountries();
    this.loadStates();
    this.loadCities();
    this.getAminities();
  }

  getTotalPropertyDet(propID: string):void{
    this.http.get(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propID}`).subscribe((response: any) => {
      this.propertyform.patchValue({
        id: response.propID,
        PropertyTitle: response.propname,
        DevelopedBy: response.developedby,
        MobileNumber: response.mobileNumber,
        EmailID: response.emailID,
        Address: response.address,
        LandMark: response.landMark,
        Country: response.country,
        State: response.state,
        City: response.city,
        NearBy: response.nearBy,
        PostalCode: response.zipCode,
        CertificateNumber: response.reraCertificateNumber,
        PropertyApprovedBy: response.propertyApprovedBy,
        PropertyType: response.propertyType,
        PropertyFor: response.propertyFor,
        PropertyStatus: response.propertyStatus,
        PropertyFacing: response.propertyFacing,
        TotalBlocks: response.totalBlocks,
        TotalFloors: response.totalFloors,
        TotalNoOfFlats: response.noOfFlats,
        BlockName: response.blockName,
        PropertyOnWhichFloor: response.propertyOnWhichFloor,
        NumberofBedrooms: response.noOfBedrooms,
        NumberofBathrooms: response.noOfBathrooms,
        NumberofBalconies: response.noOfBalconies,
        NumberofParkings: response.noOfParkings,
        AreaType: response.areaType,
        TotalArea: response.totalArea,
        CarpetArea: response.carpetArea,
        PriceFor: response.priceFor,
        PropertyTotalPrice: response.propertyTotalPrice,
        AmenitiesCharges: response.amenitiesCharges,
        MaintenanceCharges: response.maintenanceCharges,
        CorpusFund: response.corpusFund,
        BuildYear: response.buildYear,
        PossessionDate: response.possessionDate,
        ListDate: response.listDate,

        Description:response.description,
        SpecificDescription:response.specificDescription,

        WebsiteUrl: response.websiteurl,
        Pinteresturl: response.pinteresturl,
        Facebookurl: response.facebookurl,
        Twitterurl: response.twitterurl,
        GoogleLocationurl: response.googleLocationurl,
        AvailabilityOptions: response.availabilityOptions
      })
      this.uploadedImages1 = response.images.map((image: any) => {
      const byteCharacters = atob(image.fileData); // Decoding base64 to raw binary
      const byteArray = new Uint8Array(byteCharacters.length);

      // Copy the binary data into the byteArray
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Create a Blob from the byteArray
      const blob = new Blob([byteArray], { type: image.mimeType });

      // Create an object URL from the Blob
      const imageUrl = URL.createObjectURL(blob);

      return {
        ...image,
        propID: propID,
        imageUrl:imageUrl
      };
    });
    console.log('Processed image array:', this.uploadedImages1);

    this.uploadedFloorImages1 = response.floorImages.map((image: any) => {
      const byteCharacters = atob(image.fileData); // Decoding base64 to raw binary
      const byteArray = new Uint8Array(byteCharacters.length);

      // Copy the binary data into the byteArray
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Create a Blob from the byteArray
      const blob = new Blob([byteArray], { type: image.mimeType });

      // Create an object URL from the Blob
      const imageUrl = URL.createObjectURL(blob);

      return {
        ...image,
        propID: propID,
        imageUrl:imageUrl
      };
    });

    this.uploadedVideos1 = response.videos.map((video: any) => {
      const byteCharacters = atob(video.fileData); // Decoding base64 to raw binary
      const byteArray = new Uint8Array(byteCharacters.length);

      // Copy the binary data into the byteArray
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      // Create a Blob from the byteArray
      const blob = new Blob([byteArray], { type: video.mimeType });

      // Create an object URL from the Blob
      const VideoUrl = URL.createObjectURL(blob);

      return {
        ...video,
        propID: propID,
        videoUrl:VideoUrl
      };
    });

    console.log('Processed Floor image array:', this.uploadedFloorImages1);
  }, error => {
    console.error('Error fetching images:', error);
  });
  }

  // getTotalPropertyDet(propID: string): void {
  //   this.http.get(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propID}`).subscribe((response: any) => {
  
  //     // Patching the form with the response data
  //     this.propertyform.patchValue({
  //       id: response.propID,
  //       PropertyTitle: response.propname,
  //       DevelopedBy: response.developedby,
  //       MobileNumber: response.mobileNumber,
  //       EmailID: response.emailID,
  //       Address: response.address,
  //       LandMark: response.landMark,
  //       Country: response.country,
  //       State: response.state,
  //       City: response.city,
  //       NearBy: response.nearBy,
  //       PostalCode: response.zipCode,
  //       CertificateNumber: response.reraCertificateNumber,
  //       PropertyApprovedBy: response.propertyApprovedBy,
  //       PropertyType: response.propertyType,
  //       PropertyFor: response.propertyFor,
  //       PropertyStatus: response.propertyStatus,
  //       PropertyFacing: response.propertyFacing,
  //       TotalBlocks: response.totalBlocks,
  //       TotalFloors: response.totalFloors,
  //       TotalNoOfFlats: response.noOfFlats,
  //       BlockName: response.blockName,
  //       PropertyOnWhichFloor: response.propertyOnWhichFloor,
  //       NumberofBedrooms: response.noOfBedrooms,
  //       NumberofBathrooms: response.noOfBathrooms,
  //       NumberofBalconies: response.noOfBalconies,
  //       NumberofParkings: response.noOfParkings,
  //       AreaType: response.areaType,
  //       TotalArea: response.totalArea,
  //       CarpetArea: response.carpetArea,
  //       PriceFor: response.priceFor,
  //       PropertyTotalPrice: response.propertyTotalPrice,
  //       AmenitiesCharges: response.amenitiesCharges,
  //       MaintenanceCharges: response.maintenanceCharges,
  //       CorpusFund: response.corpusFund,
  //       BuildYear: response.buildYear,
  //       PossessionDate: response.possessionDate,
  //       ListDate: response.listDate,
  
  //       Description: response.description,
  //       SpecificDescription: response.specificDescription,
  
  //       WebsiteUrl: response.websiteurl,
  //       Pinteresturl: response.pinteresturl,
  //       Facebookurl: response.facebookurl,
  //       Twitterurl: response.twitterurl,
  //       GoogleLocationurl: response.googleLocationurl,
  //       AvailabilityOptions: response.availabilityOptions
  //     });
  
  //     // Process the images array from the response
  //     this.uploadedImages1 = response.images.map((image: any) => {
  //       const byteCharacters = atob(image.fileData); // Decoding base64 to raw binary
  //       const byteArray = new Uint8Array(byteCharacters.length);
  
  //       // Copy the binary data into the byteArray
  //       for (let i = 0; i < byteCharacters.length; i++) {
  //         byteArray[i] = byteCharacters.charCodeAt(i);
  //       }
  
  //       // Create a Blob from the byteArray
  //       const blob = new Blob([byteArray], { 
  //         type: image.mimeType || this.getMimeTypeFromFileName(image.fileName) // Fallback to file extension
  //       });
  
  //       // Create an object URL from the Blob
  //       const imageUrl = URL.createObjectURL(blob);
  
  //       // Return the updated image object with imageUrl and imageData (Blob)
  //       return {
  //         ...image,
  //         propID: propID,
  //         imageUrl: imageUrl,  // This will be used to display the image
  //         imageData: blob      // This is the binary data of the image
  //       };
  //     });
  
  //     // Log the processed image array for debugging
  //     console.log('Processed image array:', this.uploadedImages1);
  
  //     // Log each individual image for more detailed inspection
  //     this.uploadedImages1.forEach((image, index) => {
  //       console.log(`Image ${index + 1}:`, {
  //         id: image.id,
  //         propID: image.propID,
  //         fileName: image.fileName,
  //         mimeType: image.mimeType, // This will display the MIME type
  //         imageUrl: image.imageUrl, // This will display the Blob URL
  //         imageData: image.imageData // This will show the Blob object (binary data)
  //       });
  //     });
  
  //   }, error => {
  //     console.error('Error fetching images:', error);
  //   });
  // }
  
  // // Helper function to infer MIME type from file extension
  // getMimeTypeFromFileName(fileName: string): string {
  //   const extension = fileName.split('.').pop()?.toLowerCase();
  //   switch (extension) {
  //     case 'png': return 'image/png';
  //     case 'jpg': 
  //     case 'jpeg': return 'image/jpeg';
  //     case 'gif': return 'image/gif';
  //     case 'bmp': return 'image/bmp';
  //     case 'webp': return 'image/webp';
  //     default: return 'application/octet-stream'; // Default to generic binary
  //   }
  // }

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);  // Resolve with Base64 string
      reader.onerror = reject;  // Reject on error
      reader.readAsDataURL(blob);  // Convert the Blob to Base64
    });
  }
  // getImagesForProperty(propID: string): void {
  //   this.http.get(`https://localhost:7190/api/Users/get-images/${propID}`).subscribe((response: any) => {
  //     // Process response and convert imageData to Blob URL
  //     this.uploadedImages1 = response.map((image: any) => {
  //       const byteCharacters = atob(image.imageData); // Decoding base64 to raw binary
  //       const byteArray = new Uint8Array(byteCharacters.length);

  //       // Copy the binary data into the byteArray
  //       for (let i = 0; i < byteCharacters.length; i++) {
  //         byteArray[i] = byteCharacters.charCodeAt(i);
  //       }

  //       // Create a Blob from the byteArray
  //       const blob = new Blob([byteArray], { type: image.mimeType });

  //       // Create an object URL from the Blob
  //       const imageUrl = URL.createObjectURL(blob);
  //       console.log(imageUrl);
  //       return {
  //         ...image,
  //         propID: propID,
  //         imageUrl // Add the Blob URL to the image object
  //       };
  //     });

  //     console.log('Processed image array:', this.uploadedImages1);
  //   }, error => {
  //     console.error('Error fetching images:', error);
  //   });
  // }

  // getFeaturedImagesForProperty(propID: string): void {
  //   this.http.get(`https://localhost:7190/api/Users/get-images/${propID}`).subscribe((response: any) => {
  //     // Process response and convert imageData to Blob URL
  //     this.uploadedImages1 = response.map((image: any) => {
  //       const byteCharacters = atob(image.imageData); // Decoding base64 to raw binary
  //       const byteArray = new Uint8Array(byteCharacters.length);

  //       // Copy the binary data into the byteArray
  //       for (let i = 0; i < byteCharacters.length; i++) {
  //         byteArray[i] = byteCharacters.charCodeAt(i);
  //       }

  //       // Create a Blob from the byteArray
  //       const blob = new Blob([byteArray], { type: image.mimeType });

  //       // Create an object URL from the Blob
  //       const imageUrl = URL.createObjectURL(blob);
  //       console.log(imageUrl);
  //       return {
  //         ...image,
  //         propID: propID,
  //         imageUrl // Add the Blob URL to the image object
  //       };
  //     });

  //     console.log('Processed image array:', this.uploadedImages1);
  //   }, error => {
  //     console.error('Error fetching images:', error);
  //   });
  // }

  submitpropertyDet(){
    const data = {
      id: 0,
      propID: this.propertyform.get('id')?.value,
      propname: this.propertyform.get('PropertyTitle')?.value,
      developedby: this.propertyform.get('DevelopedBy')?.value,
      mobileNumber:new String(this.propertyform.get('MobileNumber')?.value).toString(),
      emailID:new String(this.propertyform.get('EmailID')?.value).toString(),
      address:new String(this.propertyform.get('Address')?.value).toString(),
      landMark:this.propertyform.get('LandMark')?.value,
      country:new String(this.propertyform.get('Country')?.value).toString(),
      state:new String(this.propertyform.get('State')?.value).toString(),
      City:this.propertyform.get('City')?.value,
      NearBy:this.propertyform.get('NearBy')?.value,
      ZIPCode:new String(this.propertyform.get('PostalCode')?.value).toString(),
      ReraCertificateNumber:this.propertyform.get('CertificateNumber')?.value,
      PropertyApprovedBy:this.propertyform.get('PropertyApprovedBy')?.value,
      PropertyType:new String(this.propertyform.get('PropertyType')?.value).toString(),
      PropertyFor:new String(this.propertyform.get('PropertyFor')?.value).toString(),
      PropertyStatus:new String(this.propertyform.get('PropertyStatus')?.value).toString(),
      PropertyFacing:new String(this.propertyform.get('PropertyFacing')?.value).toString(),
      TotalBlocks:new String(this.propertyform.get('TotalBlocks')?.value).toString(),
      TotalFloors:new String(this.propertyform.get('TotalFloors')?.value).toString(),
      NoOfFlats:new String(this.propertyform.get('TotalNoOfFlats')?.value).toString(),
      BlockName:this.propertyform.get('BlockName')?.value,
      PropertyOnWhichFloor:new String(this.propertyform.get('PropertyOnWhichFloor')?.value).toString(),
      NoOfBedrooms:new String(this.propertyform.get('NumberofBedrooms')?.value).toString(),
      NoOfBathrooms:new String(this.propertyform.get('NumberofBathrooms')?.value).toString(),
      NoOfBalconies:new String(this.propertyform.get('NumberofBalconies')?.value).toString(),
      NoOfParkings:new String(this.propertyform.get('NumberofParkings')?.value).toString(),
      AreaType:new String(this.propertyform.get('AreaType')?.value).toString(),
      TotalArea:new String(this.propertyform.get('TotalArea')?.value).toString(),
      CarpetArea:new String(this.propertyform.get('CarpetArea')?.value).toString(),
      PriceFor:new String(this.propertyform.get('PriceFor')?.value).toString(),
      PropertyTotalPrice:new String(this.propertyform.get('PropertyTotalPrice')?.value).toString(),
      AmenitiesCharges:new String(this.propertyform.get('AmenitiesCharges')?.value).toString(),
      MaintenanceCharges:new String(this.propertyform.get('MaintenanceCharges')?.value).toString(),
      CorpusFund:new String(this.propertyform.get('CorpusFund')?.value).toString(),
      BuildYear:new String(this.propertyform.get('BuildYear')?.value).toString(),
      PossessionDate:new Date(this.propertyform.get('PossessionDate')?.value).toISOString(),
      ListDate:new Date(this.propertyform.get('ListDate')?.value).toISOString(),

      description:new String(this.propertyform.get('Description')?.value).toString(),
      specificDescription:new String(this.propertyform.get('SpecificDescription')?.value).toString(),

      websiteurl:new String(this.propertyform.get('WebsiteUrl')?.value).toString() || null,
      Pinteresturl:new String(this.propertyform.get('Pinteresturl')?.value).toString() || null,
      Facebookurl:new String(this.propertyform.get('Facebookurl')?.value).toString() || null,
      Twitterurl:new String(this.propertyform.get('Twitterurl')?.value).toString() || null,
      GoogleLocationurl:new String(this.propertyform.get('GoogleLocationurl')?.value).toString() || null,
      availabilityOptions:new String(this.propertyform.get('AvailabilityOptions')?.value).toString(),
      userID:new String(localStorage.getItem('email')).toString(),
      ActiveStatus:"0"
    };

    console.log('Form Data:', this.propertyform.value);
    console.log('Area Type:', this.propertyform.get('areaType')?.value);
    console.log('country:', this.propertyform.get('country')?.value);
    console.log('state:', this.propertyform.get('state')?.value);
    console.log('availability Options:', this.propertyform.get('availabilityOptions')?.value);

    this.http.post("https://localhost:7190/api/Users/inspropertysample", data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        this.propertyInsStatus = response.Message;
        console.log("Data submitted successfully:", response);
      },
      error: (error) => {
        // If error occurs, show the error message
        this.propertyInsStatus = "Error Inserting Property.";
        console.error("Error details:", error);
        console.log("Error response:", error.error);
      },
      complete: () => {
        // Log when the request completes
        console.log("Request completed");
      }
    });
  }

  updatePropertyDet() {
    const data = {
      // propname: this.propertyform.get('name')?.value,
      // developedby: this.propertyform.get('developedby')?.value,
      // mobileNumber: this.propertyform.get('mobileNumber')?.value || '',
      // emailID: this.propertyform.get('emailID')?.value || '',
      // address: this.propertyform.get('address')?.value || '',
      // landMark: this.propertyform.get('landMark')?.value || '',
      // country: this.propertyform.get('country')?.value || '',
      // state: this.propertyform.get('state')?.value || '',
      // City: this.propertyform.get('City')?.value || '',
      // NearBy: this.propertyform.get('NearBy')?.value || '',
      // ZIPCode: this.propertyform.get('ZIPCode')?.value || '',
      // ReraCertificateNumber: this.propertyform.get('ReraCertificateNumber')?.value || '',
      // PropertyApprovedBy: this.propertyform.get('PropertyApprovedBy')?.value || '',
      // PropertyType: this.propertyform.get('PropertyType')?.value || '',
      // PropertyFor: this.propertyform.get('PropertyFor')?.value || '',
      // PropertyStatus: this.propertyform.get('PropertyStatus')?.value || '',
      // PropertyFacing: this.propertyform.get('PropertyFacing')?.value || '',
      // TotalBlocks: this.propertyform.get('TotalBlocks')?.value || '',
      // TotalFloors: this.propertyform.get('TotalFloors')?.value || '',
      // NoOfFlats: this.propertyform.get('NoOfFlats')?.value || '',
      // BlockName: this.propertyform.get('BlockName')?.value || '',
      // PropertyOnWhichFloor: this.propertyform.get('PropertyOnWhichFloor')?.value || '',
      // NoOfBedrooms: this.propertyform.get('NoOfBedrooms')?.value || '',
      // NoOfBathrooms: this.propertyform.get('NoOfBathrooms')?.value || '',
      // NoOfBalconies: this.propertyform.get('NoOfBalconies')?.value || '',
      // NoOfParkings: this.propertyform.get('NoOfParkings')?.value || '',
      // AreaType: this.propertyform.get('AreaType')?.value || '',
      // TotalArea: this.propertyform.get('TotalArea')?.value || '',
      // CarpetArea: this.propertyform.get('CarpetArea')?.value || '',
      // PriceFor: this.propertyform.get('PriceFor')?.value || '',
      // PropertyTotalPrice: this.propertyform.get('PropertyTotalPrice')?.value || '',
      // AmenitiesCharges: this.propertyform.get('AmenitiesCharges')?.value || '',
      // MaintenanceCharges: this.propertyform.get('MaintenanceCharges')?.value || '',
      // CorpusFund: this.propertyform.get('CorpusFund')?.value || '',
      // BuildYear: this.propertyform.get('BuildYear')?.value || '',
      // PossessionDate: this.propertyform.get('PossessionDate')?.value ? new Date(this.propertyform.get('PossessionDate')?.value).toISOString() : null,
      // ListDate: this.propertyform.get('ListDate')?.value ? new Date(this.propertyform.get('ListDate')?.value).toISOString() : null,
      // websiteurl: this.propertyform.get('websiteurl')?.value || null,
      // Pinteresturl: this.propertyform.get('Pinteresturl')?.value || null,
      // Facebookurl: this.propertyform.get('Facebookurl')?.value || null,
      // Twitterurl: this.propertyform.get('Twitterurl')?.value || null,
      // GoogleLocationurl: this.propertyform.get('GoogleLocationurl')?.value || null,
      // availabilityOptions: this.propertyform.get('availabilityOptions')?.value || '',
      // userID: new String(localStorage.getItem('email')).toString(),
      // ActiveStatus: "0"

      propname: this.propertyform.get('PropertyTitle')?.value,
      developedby: this.propertyform.get('DevelopedBy')?.value,
      mobileNumber:new String(this.propertyform.get('MobileNumber')?.value).toString(),
      emailID:new String(this.propertyform.get('EmailID')?.value).toString(),
      address:new String(this.propertyform.get('Address')?.value).toString(),
      landMark:this.propertyform.get('LandMark')?.value,
      country:new String(this.propertyform.get('Country')?.value).toString(),
      state:new String(this.propertyform.get('State')?.value).toString(),
      City:this.propertyform.get('City')?.value,
      NearBy:this.propertyform.get('NearBy')?.value,
      ZIPCode:new String(this.propertyform.get('PostalCode')?.value).toString(),
      ReraCertificateNumber:this.propertyform.get('CertificateNumber')?.value,
      PropertyApprovedBy:this.propertyform.get('PropertyApprovedBy')?.value,
      PropertyType:new String(this.propertyform.get('PropertyType')?.value).toString(),
      PropertyFor:new String(this.propertyform.get('PropertyFor')?.value).toString(),
      PropertyStatus:new String(this.propertyform.get('PropertyStatus')?.value).toString(),
      PropertyFacing:new String(this.propertyform.get('PropertyFacing')?.value).toString(),
      TotalBlocks:new String(this.propertyform.get('TotalBlocks')?.value).toString(),
      TotalFloors:new String(this.propertyform.get('TotalFloors')?.value).toString(),
      NoOfFlats:new String(this.propertyform.get('TotalNoOfFlats')?.value).toString(),
      BlockName:this.propertyform.get('BlockName')?.value,
      PropertyOnWhichFloor:new String(this.propertyform.get('PropertyOnWhichFloor')?.value).toString(),
      NoOfBedrooms:new String(this.propertyform.get('NumberofBedrooms')?.value).toString(),
      NoOfBathrooms:new String(this.propertyform.get('NumberofBathrooms')?.value).toString(),
      NoOfBalconies:new String(this.propertyform.get('NumberofBalconies')?.value).toString(),
      NoOfParkings:new String(this.propertyform.get('NumberofParkings')?.value).toString(),
      AreaType:new String(this.propertyform.get('AreaType')?.value).toString(),
      TotalArea:new String(this.propertyform.get('TotalArea')?.value).toString(),
      CarpetArea:new String(this.propertyform.get('CarpetArea')?.value).toString(),
      PriceFor:new String(this.propertyform.get('PriceFor')?.value).toString(),
      PropertyTotalPrice:new String(this.propertyform.get('PropertyTotalPrice')?.value).toString(),
      AmenitiesCharges:new String(this.propertyform.get('AmenitiesCharges')?.value).toString(),
      MaintenanceCharges:new String(this.propertyform.get('MaintenanceCharges')?.value).toString(),
      CorpusFund:new String(this.propertyform.get('CorpusFund')?.value).toString(),
      BuildYear:new String(this.propertyform.get('BuildYear')?.value).toString(),
      PossessionDate:new Date(this.propertyform.get('PossessionDate')?.value).toISOString(),
      ListDate:new Date(this.propertyform.get('ListDate')?.value).toISOString(),

      description:new String(this.propertyform.get('Description')?.value).toString(),
      specificDescription:new String(this.propertyform.get('SpecificDescription')?.value).toString(),

      websiteurl:new String(this.propertyform.get('WebsiteUrl')?.value).toString() || null,
      Pinteresturl:new String(this.propertyform.get('Pinteresturl')?.value).toString() || null,
      Facebookurl:new String(this.propertyform.get('Facebookurl')?.value).toString() || null,
      Twitterurl:new String(this.propertyform.get('Twitterurl')?.value).toString() || null,
      GoogleLocationurl:new String(this.propertyform.get('GoogleLocationurl')?.value).toString() || null,
      availabilityOptions:new String(this.propertyform.get('AvailabilityOptions')?.value).toString(),
      userID:new String(localStorage.getItem('email')).toString(),
      ActiveStatus:"0"
    };
  
    if (!this.propID || this.propID.trim() === '') {
      console.error("Invalid propID");
      return;
    }
    console.log(data);
  
    this.http.put(`https://localhost:7190/api/Users/updatePropertyDet/${this.propID}`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        this.propertyInsStatus = response.Message;
        console.log("Updated Property Details Successfully:", response);
      },
      error: (error) => {
        this.propertyInsStatus = "Error Inserting Property.";
        console.error("Error details:", error);
        console.log("Full Error Object:", error);
      },
      complete: () => {
        console.log("Request completed");
      }
    });
  }

  addNewProperty(){
    this.addnewPropertyclicked=true;
    this.generatePropertyID();
    this.loadCountries();
    this.loadStates();
    this.loadCities();
    this.getAminities();
  }

  onWhosePropertySelectionChange(event:any):void{
    console.log(event.target.value);
    if(event.target.value=='1'){
      this.getownProperties();
    }
    else if(event.target.value=='2'){
      this.getUserProperties();
    }
    else{
      this.fetchProperties();
    }
  }
  userID=localStorage.getItem('email');
  getownProperties(){
    this.http.get(`https://localhost:7190/api/Users/GetAllPropertyDetailsWithUserID?userID=${this.userID}`)  // Adjust the API endpoint accordingly
    .subscribe((response: any) => {
      // Map the response to extract only the propID, propname, and developedby fields
      this.properties = response.map((property: any) => ({
        propID: property.propID,
        propname: property.propname,  // Adjust field names if necessary
        developedby: property.developedby
      }));

      console.log('Mapped properties:', this.properties);
    }, error => {
      console.error('Error fetching properties:', error);
    });
    
  }
  getUserProperties(){
    this.http.get(`https://localhost:7190/api/Users/GetAllUsersPropertyDetails?userID=${this.userID}`)  // Adjust the API endpoint accordingly
    .subscribe((response: any) => {
      this.properties = response.map((property: any) => ({
        propID: property.propID,
        propname: property.propname,
        developedby: property.developedby
      }));

      console.log('Mapped properties:', this.properties);
    }, error => {
      console.error('Error fetching properties:', error);
    });
    
  }

  currentPage = 1;
  pageSize = 5; // Fixed page size (5 items per page)
  searchQuery: string = ''; // Variable to hold the search query


  // Filter properties based on the search query
  get filteredProperties() {
    return this.properties.filter(property => 
      property.propID.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.propname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.developedby.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Get the total number of pages after filtering
  get totalPages(): number {
    const filteredProperties = this.filteredProperties;
    return Math.ceil(filteredProperties.length / this.pageSize);
  }

  // Get the properties for the current page after filtering
  getPaginatedProperties() {
    const filteredProperties = this.filteredProperties;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return filteredProperties.slice(start, end);
  }

  // Set the current page, ensuring it's within the valid range
  setPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Go to the previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Go to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onPropertiesChange(newProperties: any[]) {
    this.properties = newProperties;
  }

  getAminities(): void {
    this.http.get('https://localhost:7190/api/Users/GetAllAminities')
      .subscribe((response: any) => {
        console.log('API response:', response); // Log the full response object
        if (response && Array.isArray(response.data)) {
          // Map the response data to the aminities array
          this.aminities = response.data.map((data: any) => ({
            aminitieID: data.aminitieID,
            name: data.name,
            description: data.description
          }));
          this.cdRef.detectChanges();  // Manually trigger change detection
        } else {
          console.error('Unexpected response format or no amenities found');
          this.aminities = [];
        }
      }, error => {
        console.error('Error fetching amenities:', error);
      });
  }
  selectedAmenities: any[] = [];
  Amenities: any[] = [];
  allSelected: boolean = false;
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedAmenities = this.Amenities.map(amenity => amenity.id);
    } else {
      this.selectedAmenities = [];
    }
    this.updateSelectAllState();
  }
  updateSelectAllState() {
    this.allSelected = this.selectedAmenities.length === this.Amenities.length;
  }

}
