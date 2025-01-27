import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuillModule,QuillEditorComponent } from 'ngx-quill';
import Compressor from 'compressorjs';

interface UploadedImage {
  file: File;
  path: string;
  size: number;
}


interface Amenity {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-property-component',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,HttpClientModule,QuillModule,NgIf,NgFor,NgClass],
  templateUrl: './add-property-component.component.html',
  styleUrl: './add-property-component.component.css'
})
export class AddPropertyComponentComponent implements OnInit {
  isModalOpen: any;
  isVideoModalOpen:any;
  PropertyInsUpdateStatus:string="";


 

  
  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;

  constructor(public http:HttpClient,private cdRef: ChangeDetectorRef,private sanitizer: DomSanitizer){}
  
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
        this.properties = response.map((property: any) => {
          let PropertyStatus: string = '';
          if (property.activeStatus === "2") {
            PropertyStatus = "Not Approved";
          } else if (property.activeStatus === "1") {
            PropertyStatus = "Approved";
          } else if (property.activeStatus === "0") {
            PropertyStatus = "Pending";
          }

          let PropertyIsActiveStatus: string = '';
          if (property.propActiveStatus === "1") {
            PropertyIsActiveStatus = "Active";
          } else if (property.propActiveStatus === "0") {
            PropertyIsActiveStatus = "Not Active";
          }

          console.log("property Status:",property.propActiveStatus);
  
          return {
            propID: property.propID,
            propname: property.propname,
            developedby: property.developedby,
            status: PropertyStatus,
            IsActiveStatus:PropertyIsActiveStatus
          };
        });
  
        console.log('Mapped properties:', this.properties);
      }, error => {
        console.error('Error fetching properties:', error);
      });
  }

  // postalCode:[Validators.required, Validators.pattern(/^\d{6}$/)]
  // totalNoOfFlats,blockname,NumberofBedrooms,CarpetArea,AmenitiesCharges=, [Validators.required, Validators.min(1)]
  // buildYear=, [Validators.required, Validators.pattern(/^\d{4}$/)]
  
  propertyform: FormGroup = new FormGroup({
    id: new FormControl(),
    PropertyTitle: new FormControl('', [Validators.required]),
    DevelopedBy: new FormControl('', [Validators.required]),
    MobileNumber: new FormControl('', [Validators.required]),
    EmailID: new FormControl('', [Validators.required, Validators.email]),
    Address: new FormControl(''),
    LandMark: new FormControl(),
    Country: new FormControl('', [Validators.required]),
    State: new FormControl('', [Validators.required]),
    City: new FormControl('', [Validators.required]),
    NearBy: new FormControl(''),
    PostalCode: new FormControl(''), 
    CertificateNumber: new FormControl(''),
    PropertyApprovedBy: new FormControl(''),
    PropertyType: new FormControl(''),
    PropertyFor: new FormControl(''),
    PropertyStatus: new FormControl(''),
    PropertyFacing: new FormControl(''),
    TotalBlocks: new FormControl(''),
    TotalFloors: new FormControl(''),
    TotalNoOfFlats: new FormControl(''),
    BlockName: new FormControl(''),
    PropertyOnWhichFloor: new FormControl(''),
    NumberofBedrooms: new FormControl(''),
    NumberofBathrooms: new FormControl(''),
    NumberofBalconies: new FormControl(''),
    NumberofParkings: new FormControl(''),
    AreaType: new FormControl('', [Validators.required]),
    TotalArea: new FormControl('', [Validators.required, Validators.min(1),this.areaValidator]),
    CarpetArea: new FormControl(''),
    PriceFor: new FormControl('', [Validators.required, Validators.min(1),this.priceForValidator]),
    PropertyTotalPrice: new FormControl({ value: '', disabled: true }),
    AmenitiesCharges: new FormControl(''),
    MaintenanceCharges: new FormControl(''),
    CorpusFund: new FormControl(''),
    BuildYear: new FormControl(''),
    PossessionDate: new FormControl(''),
    ListDate: new FormControl(''),
    
    Description: new FormControl(''),
    SpecificDescription: new FormControl(''),
    
    WebsiteUrl: new FormControl(''),
    Pinteresturl: new FormControl(''),
    Facebookurl: new FormControl(''),
    Twitterurl: new FormControl(''),
    GoogleLocationurl: new FormControl(''),
    AvailabilityOptions: new FormControl()
  });
  
  countries: any[] = [];
  states: any[] = [];
  cities:any[]=[];
  propertytypes:any[]=[];
  selectedCountry: number | null = null;
  selectedState: number | null = null;
  selectedCity:number|null=null;
  selectedPropertyType:String|null=null;
  selectedPropertyFor:string|null=null;
  selectedPropertyStatus:string|null=null;
  selectedPropertyFacing:string|null=null;
  selectedAreaType:string|null=null;
  amenities: any[] = [];
  selectedAmenities: any[] = [];
  propertyImagesClicked:boolean=false;
  propertyFloorImagesClicked:boolean=false;
  propertyVideosClicked:boolean=false;
  propertyDocumentsClicked:boolean=false;


  SelectedCountryName: string = '';
  SelectedStateName:string='';
  SelectedCityName:string='';
  SelectedPropertyTypeName:string='';

  editclicked: boolean = false;
  addnewPropertyclicked:boolean=false;
  //properties: Array<{ propID: string, propname: string, developedby: string }> = [];
  properties: Array<{ propID: string, propname: string, developedby: string, status: string, IsActiveStatus: string,IsActiveStatusBoolean:string }> = [];
  propertyInsStatus: any = '';
  //aminities: Array<{ aminitieID: string, name: string, description: string }> = [];
  //propertyImages
  propID: string = '';
  selectedPropertyFiles: FileList | null = null;
  selectedPropertyFloorFiles: FileList | null = null;
  selectedPropertyVideoFiles: FileList | null = null;
  selectedPropertyDocumentFiles:FileList | null = null;
  //uploadedImages1: Array<{ id: number, propID: string, fileName: string, mimeType: string, imageData: Blob, imageUrl: string }> = [];
  // uploadedImages1: Array<{ 
  //   id: number, 
  //   propID: string, 
  //   fileName: string, 
  //   mimeType: string, 
  //   imageData: Blob, 
  //   imageUrl: string,
  //   DefaultImage: string
  // }> = [];

  uploadedImages1: Array<{ 
    id: number; 
    propID: string; 
    fileName: string; 
    mimeType: string; 
    imageData: Blob; 
    imageUrl: string; 
    DefaultImage: string; 
    ImageOrder: number;     // New property for internal image order
    customOrder: number;    // New property for custom order input
  }> = [];
  

  // uploadedFloorImages1:Array<{ 
  //   id: number, 
  //   propID: string, 
  //   fileName: string, 
  //   mimeType: string, 
  //   imageData: Blob, 
  //   imageUrl: string 
  // }> = [];

  uploadedFloorImages1: Array<{ 
    id: number; 
    propID: string; 
    fileName: string; 
    mimeType: string; 
    imageData: Blob; 
    imageUrl: string; 
    DefaultImage: string; 
    ImageOrder: number;     // New property for internal image order
    customOrder: number;    // New property for custom order input
  }> = [];

  uploadedVideos1:Array<{ 
    id: number, 
    propID: string, 
    fileName: string, 
    mimeType: string, 
    videoData: Blob, 
    videoUrl: string 
  }> = [];

  uploadedDocuments1:Array<{ 
    id: number, 
    propID: string, 
    fileName: string, 
    mimeType: string, 
    DocumentData: Blob, 
    DocumentUrl: string 
  }> = [];
  
  uploadedImages: Array<{ path: string,file:File,size:number }> = [];
  uploadedFloorImages:Array<{ path: string }> = [];
  uploadedVideos:Array<{ path: string }> = [];
  uploadedDocuments:Array<{ path: string,DocumentPath:SafeResourceUrl }> = [];
  selectedImage: string = '';
  seletedVideo:string='';
  // selectedFloorImage:string = '';

  // calculateTotalPrice(): void {
  //   const totalArea = this.propertyform.get('TotalArea')?.value;
  //   const priceFor = this.propertyform.get('PriceFor')?.value;

  //   if (totalArea && priceFor) {
  //     const totalPrice = totalArea * priceFor;
  //     this.propertyform.get('PropertyTotalPrice')?.setValue(totalPrice, { emitEvent: false });
  //   } else {
  //     this.propertyform.get('PropertyTotalPrice')?.setValue('', { emitEvent: false });
  //   }
  // }

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
      const selectedCountry = this.countries.find(country => country.id === this.selectedCountry);
      if (selectedCountry) {
        this.SelectedCountryName = selectedCountry.name;
        console.log(this.SelectedCountryName);
      }
      this.loadStates();  
    }
  }

  onStateChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const stateId = selectElement.value;
      this.selectedState = Number(stateId);

      const selectedState = this.states.find(state => state.id === this.selectedState);
      if (selectedState) {
        this.SelectedStateName = selectedState.name;
        console.log(this.SelectedStateName);
        console.log(this.selectedState);
      }
      this.loadCities();  
    }
  }

  // oncityChange(event: Event): void {
  //   const selectElement = event.target as HTMLSelectElement; 
  //   if (selectElement) {
  //     const CityId = selectElement.value;
  //     this.selectedCity = Number(CityId); 

  //     const selectedCity = this.cities.find(city => city.id === this.selectedCity);
  //     if (selectedCity) {
  //       this.SelectedCityName = selectedCity.name;
  //       console.log(this.SelectedCityName);
  //     }
  //   }
  // }

  onCityChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      const CityId = selectElement.value;
      this.selectedCity = Number(CityId);

      const selectedCity = this.cities.find(city => city.id === this.selectedCity);
      if (selectedCity) {
        this.SelectedCityName = selectedCity.name;
      } else {
        console.error('City not found');
      }
    }
  }

  getPropertTypes(): void {
    this.http.get('https://localhost:7190/api/Users/GetAllPropertyTypes')
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          // Map the response data to the aminities array
          this.propertytypes = response.data.map((data: any) => ({
            id: data.propertyTypeID,
            name: data.name,
            description: data.description
          }));
          console.log(this.propertytypes);
        } else {
          console.error('Unexpected response format or no reviews found');
          this.propertytypes = [];
        }
      }, error => {
        console.error('Error fetching reviews:', error);
      });
  }
  onPropertyTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const PropertyTypeId = selectElement.value;
      this.selectedPropertyType = String(PropertyTypeId); 

      const selectedPropTypeName = this.propertytypes.find(propertytype => propertytype.id === this.selectedPropertyType);
      if (selectedPropTypeName) {
        this.SelectedPropertyTypeName = selectedPropTypeName.name;
        console.log(this.SelectedPropertyTypeName);
      }
    }
  }



  onPropertyForChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const PropertyForId = selectElement.value;
      this.selectedPropertyFor = String(PropertyForId); 
    }
  }

  onPropertyStatusChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const PropertyStatus = selectElement.value;
      this.selectedPropertyStatus = String(PropertyStatus); 
    }
  }

  onPropertyFacingChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const PropertyFacing = selectElement.value;
      this.selectedPropertyFacing = String(PropertyFacing); 
    }
  }

  onAreaTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      const Areatype = selectElement.value;
      this.selectedAreaType = String(Areatype); 
    }
  }

  fetchAminities(): void {
    this.http.get<any[]>('https://localhost:7190/api/Users/GetAllAminities')
      .subscribe((response: any) => {
        console.log('API response:', response);
        if (response && Array.isArray(response.data)) {
          // Map the response data to the aminities array
          this.amenities = response.data.map((data: any) => ({
            aminitieID: data.aminitieID,
            name: data.name,
            description: data.description
          }));
        } else {
          console.error('Unexpected response format or no reviews found');
          this.amenities = [];
        }
      }, error => {
        console.error('Error fetching reviews:', error);
      });
  }

  isSelected(amenity: any): boolean {
    return this.selectedAmenities.some(item => item.id === amenity.aminitieID);
  }
  
  onAmenityChange(event: any, amenity: any): void {
    if (!amenity || !event || !event.target) return;
  
    // Add to selectedAmenities if checked and not already selected
    if (event.target.checked) {
      if (amenity.aminitieID && amenity.name) {
        // Only push valid amenity (non-empty id and name) to selectedAmenities
        if (!this.selectedAmenities.some(item => item.id === amenity.aminitieID)) {
          this.selectedAmenities.push({ id: amenity.aminitieID, name: amenity.name });
        }
      }
    } else {
      // Remove from selectedAmenities if unchecked
      const index = this.selectedAmenities.findIndex(item => item.id === amenity.aminitieID);
      if (index > -1) {
        this.selectedAmenities.splice(index, 1);
      }
    }
  
    // Filter out any empty or invalid items (optional, to be extra cautious)
    this.selectedAmenities = this.selectedAmenities.filter(item => item.id && item.name);
  
    console.log(this.selectedAmenities);  // Log the selected amenities
  }

  propertyImagesClick(){
    this.propertyImagesClicked=true;
    this.propertyFloorImagesClicked=false;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=false;
    const propID:string=(this.propertyform.get('id')?.value).toString();
    this.getPropertyImagesForProperty(propID);
  }
  
  propertyFloorImagesClick(){
    this.propertyImagesClicked=false;
    this.propertyFloorImagesClicked=true;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=false;
    const propID:string=(this.propertyform.get('id')?.value).toString();
    this.getPropertyFloorImagesForProperty(propID);
  }

  propertyVideoClick(){
    this.propertyImagesClicked=false;
    this.propertyFloorImagesClicked=false;
    this.propertyVideosClicked=true;
    this.propertyDocumentsClicked=false;
    const propID:string=(this.propertyform.get('id')?.value).toString();
    this.getPropertyVideo(propID);
  }

  propertyDocumentsClick(){
    this.propertyImagesClicked=false;
    this.propertyFloorImagesClicked=false;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=true;
    const propID:string=(this.propertyform.get('id')?.value).toString();
    this.getPropertyDocument(propID);
  }

  propertyMediaBackClick(){
    this.propertyImagesClicked=false;
    this.propertyFloorImagesClicked=false;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=false;
  }

  propertyImagesUploadButtonClick:boolean=false;
  propertyfloorImagesUploadButtonClick:boolean=false;
  propertyVideoUploadButtonClick:boolean=false;
  propertydocumenetUploadButtonClick:boolean=false;

  uploadPropertyImages(): void {

    this.propertyImagesUploadButtonClick=true;
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
        this.PropertyOnfileClicked=false;
        this.propertyImagesUploadButtonClick=false;
        this.getPropertyImagesForProperty(this.propID);  // Refresh the images after upload
      },
      
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  uploadPropertyFloorImages(): void {
    this.propertyfloorImagesUploadButtonClick=true;

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
        this.PropertyFloorImageOnFileClicked=false;
        this.propertyfloorImagesUploadButtonClick=false;
        this.getPropertyFloorImagesForProperty(this.propID);  // Refresh the images after upload
      },
      
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  uploadPropertyVideos(): void {
    this.propertyVideoUploadButtonClick=true;

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
        this.PropertyVideoOnFileClicked=false;
        this.propertyVideoUploadButtonClick=false;
        this.getPropertyVideo(this.propID);  // Refresh the images after upload
      },
      
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  uploadPropertyDocuments(): void {
    this.propertydocumenetUploadButtonClick=true;
    console.log(this.propID);
    if (!this.propID || !this.selectedPropertyDocumentFiles || this.selectedPropertyDocumentFiles.length === 0) {
      alert('Property ID is required and you must select Document.');
      return;
    }

    const formData = new FormData();
    formData.append('propID', this.propID);

    // Append each selected file to formData
    Array.from(this.selectedPropertyDocumentFiles).forEach((file: File) => {
      formData.append('documents', file, file.name);
    });

    // Make HTTP request to upload the files
    this.http.post('https://localhost:7190/api/Users/uploadPropertyDocument', formData).subscribe(
      response => {
        console.log('Property Document uploaded successfully:', response);
        this.PropertyDocumentOnFileClicked=false;
        this.propertydocumenetUploadButtonClick=false;
        this.getPropertyDocument(this.propID); 
      },
      
      error => {
        console.error('Upload failed:', error);
      }
    );
  }



  // getPropertyImagesForProperty(propID: string): void {
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
  
        // Add the customOrder property, defaulting to ImageOrder or 0 if not provided
        const customOrder = image.imageOrder ? parseInt(image.imageOrder, 10) : 0;
  
        // Return the updated image object
        return {
          ...image,
          propID: propID,
          imageUrl,           // Add the Blob URL to the image object
          ImageOrder: image.imageOrder, // Include the ImageOrder
          customOrder         // Add the customOrder field
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

        const customOrder = image.imageOrder ? parseInt(image.imageOrder, 10) : 0;

        // Create an object URL from the Blob
        const imageUrl = URL.createObjectURL(blob);
        console.log(imageUrl);
        return {
          ...image,
          propID: propID,
          imageUrl, // Add the Blob URL to the image object
          ImageOrder: image.imageOrder, // Include the ImageOrder
          customOrder         // Add the customOrder field
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
        const byteCharacters = atob(video.videoData); // Decoding base64 to raw binary
        const byteArray = new Uint8Array(byteCharacters.length);

        // Copy the binary data into the byteArray
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        // Create a Blob from the byteArray
        const blob = new Blob([byteArray], { type: video.mimeType });

        // Create an object URL from the Blob
        const videosUrl = URL.createObjectURL(blob);
        console.log("VideoUrl:", videosUrl);
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

  getPropertyDocument(propID: string): void {
    this.http.get(`https://localhost:7190/api/Users/get-PropertyDocument/${propID}`).subscribe((response: any) => {
      // Process response and convert imageData to Blob URL
      this.uploadedDocuments1 = response.map((document: any) => {
        const byteCharacters = atob(document.documentData); // Decoding base64 to raw binary
        const byteArray = new Uint8Array(byteCharacters.length);

        // Copy the binary data into the byteArray
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        // Create a Blob from the byteArray
        const blob = new Blob([byteArray], { type: document.mimeType });

        // Create an object URL from the Blob
        const documentsUrl = URL.createObjectURL(blob);

        const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(documentsUrl);
        console.log("documentUrl:", documentsUrl);
        return {
          ...document,
          propID: propID,
          safeUrl // Add the Blob URL to the image object
        };
      });

      console.log('Processed Video array:', this.uploadedVideos1);
    }, error => {
      console.error('Error fetching images:', error);
    });
  }


  // deleteImage(image: any): void {
  //   const index = this.uploadedImages.indexOf(image);

  //   console.log(index);
  //   if (index !== -1) {
  //     this.uploadedImages.splice(index, 1); // Remove image from table
  //   }
  // }

  deleteImage(image: any): void {
    const index = this.uploadedImages.indexOf(image);

    if (index !== -1) {
      // Remove image preview from the array
      this.uploadedImages.splice(index, 1);

      // Update the selected files list by filtering out the deleted image's file
      if (this.selectedPropertyFiles) {
        const filesArray = Array.from(this.selectedPropertyFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);

        // Create a new DataTransfer object and add the remaining files to it
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));

        // Update selectedPropertyFiles with the new FileList
        this.selectedPropertyFiles = dataTransfer.files;
      }
    }
  }

  deleteFloorImage(image: any): void {
    const index = this.uploadedFloorImages.indexOf(image);

    if (index !== -1) {
      // Remove image preview from the array
      this.uploadedFloorImages.splice(index, 1);

      // Update the selected files list by filtering out the deleted image's file
      if (this.selectedPropertyFloorFiles) {
        const filesArray = Array.from(this.selectedPropertyFloorFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);

        // Create a new DataTransfer object and add the remaining files to it
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));

        // Update selectedPropertyFiles with the new FileList
        this.selectedPropertyFloorFiles = dataTransfer.files;
      }
    }
  }

  deleteVideoSelected(video: any): void {
    const index = this.uploadedVideos.indexOf(video);

    if (index !== -1) {
      // Remove image preview from the array
      this.uploadedVideos.splice(index, 1);

      // Update the selected files list by filtering out the deleted image's file
      if (this.selectedPropertyVideoFiles) {
        const filesArray = Array.from(this.selectedPropertyVideoFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);

        // Create a new DataTransfer object and add the remaining files to it
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));

        // Update selectedPropertyFiles with the new FileList
        this.selectedPropertyVideoFiles = dataTransfer.files;
      }
    }
  }

  deletePropertyDocumentSelected(document: any): void {
    const index = this.uploadedDocuments.indexOf(document);

    if (index !== -1) {
      // Remove image preview from the array
      this.uploadedDocuments.splice(index, 1);

      // Update the selected files list by filtering out the deleted image's file
      if (this.selectedPropertyDocumentFiles) {
        const filesArray = Array.from(this.selectedPropertyDocumentFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);

        // Create a new DataTransfer object and add the remaining files to it
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));

        // Update selectedPropertyFiles with the new FileList
        this.selectedPropertyDocumentFiles = dataTransfer.files;
      }
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

  deleteDocument(propertyId: string, DocumentID: number): void {
    this.http.delete(`https://localhost:7190/api/Users/delete-PropertyDocument/${propertyId}/${DocumentID}`, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    }).subscribe({
      next: (response: string) => {
        console.log('Document deleted from database:', response);
        
        // Now remove the image from the frontend list
        const index = this.uploadedDocuments1.findIndex(document => document.id === DocumentID && document.propID === propertyId);
        if (index !== -1) {
          this.uploadedDocuments1.splice(index, 1);
        }
        this.getPropertyDocument(this.propID);
      },
      error: (error) => {
        console.error('Error deleting document:', error);
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

  PropertyOnfileClicked:boolean=false;
  PropertyFloorImageOnFileClicked:boolean=false;
  PropertyVideoOnFileClicked:boolean=false;
  PropertyDocumentOnFileClicked:boolean=false;
  // onFileSelect(event: any): void {
  //   this.PropertyOnfileClicked=true;
  //   if (event?.target?.files) {
  //     this.selectedPropertyFiles = event.target.files;
  //     console.log(this.selectedPropertyFiles);

  //     if (this.selectedPropertyFiles && this.selectedPropertyFiles.length > 0) {
  //       this.uploadedImages = [];  // Clear previous images

  //       // Convert FileList to an array and create image previews
  //       Array.from(this.selectedPropertyFiles).forEach((file: File) => {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           // Push the data URL (base64 string) into the uploadedImages array
  //           this.uploadedImages.push({ path: reader.result as string });
  //         };
  //         reader.readAsDataURL(file);  // Read file as data URL for preview
  //       });
  //     } else {
  //       console.error('No files selected');
  //     }
  //   } else {
  //     console.error('No files in the input');
  //   }
  // }

 compressedImageSize: string | null = null;

 onFileSelect(event: any): void {
  this.PropertyOnfileClicked = true;

  if (event?.target?.files) {
    this.selectedPropertyFiles = event.target.files;
    console.log(this.selectedPropertyFiles);

    if (this.selectedPropertyFiles && this.selectedPropertyFiles.length > 0) {
      this.uploadedImages = [];  // Clear previous images

      Array.from(this.selectedPropertyFiles).forEach((file: File) => {
        const fileSizeKB = file.size / 1024; // Convert bytes to KB

        // Preview the original image first
        const reader = new FileReader();
        reader.onload = () => {
          // Push the original image into uploadedImages array
          this.uploadedImages.push({
            file: file,
            path: reader.result as string,
            size: fileSizeKB
          });

          console.log(this.uploadedImages, "Original image preview");

          if (fileSizeKB >= 1024) {
            // Compress image if file size is larger than 1MB
            new Compressor(file, {
              quality: 0.6, // Adjust quality to reduce file size
              maxWidth: 800, // Optional: set max width
              maxHeight: 800, // Optional: set max height
              success: (compressedFile: Blob) => {
                
                // Type cast compressedFile (Blob) to File type
                const compressedFileAsFile = compressedFile as File;

                const compressedReader = new FileReader();
                compressedReader.onload = () => {
                  // Push the compressed image into the uploadedImages array
                  this.uploadedImages.push({
                    file: compressedFileAsFile,  // Use the compressed file as a File
                    path: compressedReader.result as string,
                    size: compressedFileAsFile.size / 1024 // Size in KB
                  });

                  // Log the compressed file size
                  const compressedSizeKB = compressedFileAsFile.size / 1024; // Size in KB
                  const compressedSizeMB = compressedSizeKB / 1024; // Size in MB

                  this.compressedImageSize = `Compressed size: ${compressedSizeKB.toFixed(2)} KB (${compressedSizeMB.toFixed(2)} MB)`;
                  console.log('Compressed file size in KB:', compressedSizeKB.toFixed(2));
                  console.log('Compressed file size in MB:', compressedSizeMB.toFixed(2));
                };
                compressedReader.readAsDataURL(compressedFileAsFile);  // Read compressed file as Data URL
                console.log('Compression successful');
              },
              error: (err) => {
                console.error('Compression failed', err);
              }
            });
          }
        };
        reader.readAsDataURL(file);  // Read the original file as Data URL
      });
    } else {
      console.error('No files selected');
    }
  } else {
    console.error('No files in the input');
  }
}


  
  


  // onFileSelect(event: any): void {
  //   this.PropertyOnfileClicked = true;
  
  //   if (event?.target?.files) {
  //     this.selectedPropertyFiles = event.target.files;
  //     console.log(this.selectedPropertyFiles);
  
  //     if (this.selectedPropertyFiles && this.selectedPropertyFiles.length > 0) {
  //       this.uploadedImages = [];  // Clear previous images
  
  //       // Convert FileList to an array and create image previews
  //       Array.from(this.selectedPropertyFiles).forEach((file: File) => {
  //         // Check if the file size is less than 1024KB (1MB = 1024KB)
  //         const fileSizeKB = file.size / 1024; // Convert bytes to KB
  
  //         if (fileSizeKB < 1024) { // 1MB = 1024KB
  //           const reader = new FileReader();
  //           reader.onload = () => {
  //             // Push the data URL (base64 string) into the uploadedImages array
  //             this.uploadedImages.push({ path: reader.result as string });
  //           };
  //           reader.readAsDataURL(file);  // Read file as data URL for preview
  //         } else {
  //           // Show a popup alert when the file size is too large
  //           this.PropertyOnfileClicked=false;
  //           alert(`File ${file.name} is too large and will not be uploaded. Maximum size allowed is 1MB.`);
  //         }
  //       });
  //     } else {
  //       console.error('No files selected');
  //     }
  //   } else {
  //     console.error('No files in the input');
  //   }
  // }
  
  
  

  

  // onFloorFileSelect(event: any): void {
  //   this.PropertyFloorImageOnFileClicked=true;
  //   if (event?.target?.files) {
  //     this.selectedPropertyFloorFiles = event.target.files;

  //     if (this.selectedPropertyFloorFiles && this.selectedPropertyFloorFiles.length > 0) {
  //       this.uploadedFloorImages = [];  // Clear previous images

  //       // Convert FileList to an array and create image previews
  //       Array.from(this.selectedPropertyFloorFiles).forEach((file: File) => {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           // Push the data URL (base64 string) into the uploadedImages array
  //           this.uploadedFloorImages.push({ path: reader.result as string });
  //         };
  //         reader.readAsDataURL(file);  // Read file as data URL for preview
  //       });
  //     } else {
  //       console.error('No files selected');
  //     }
  //   } else {
  //     console.error('No files in the input');
  //   }
  // }

  onFloorFileSelect(event: any): void {
    this.PropertyFloorImageOnFileClicked = true;
  
    if (event?.target?.files) {
      this.selectedPropertyFloorFiles = event.target.files;
  
      if (this.selectedPropertyFloorFiles && this.selectedPropertyFloorFiles.length > 0) {
        this.uploadedFloorImages = [];  // Clear previous images
  
        // Convert FileList to an array and create image previews
        Array.from(this.selectedPropertyFloorFiles).forEach((file: File) => {
          // Check if the file size is less than 1024KB (1MB = 1024KB)
          const fileSizeKB = file.size / 1024; // Convert bytes to KB
  
          if (fileSizeKB < 1024) { // 1MB = 1024KB
            const reader = new FileReader();
            reader.onload = () => {
              // Push the data URL (base64 string) into the uploadedImages array
              this.uploadedFloorImages.push({ path: reader.result as string });
            };
            reader.readAsDataURL(file);  // Read file as data URL for preview
          } else {
            // Show a popup alert when the file size is too large
            this.PropertyFloorImageOnFileClicked=false;
            alert(`File ${file.name} is too large and will not be uploaded. Maximum size allowed is 1MB.`);
          }
        });
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }
  

  // onVideoFileSelect(event: any): void {
  //   this.PropertyVideoOnFileClicked=true;
  //   if (event?.target?.files) {
  //     this.selectedPropertyVideoFiles = event.target.files;

  //     if (this.selectedPropertyVideoFiles && this.selectedPropertyVideoFiles.length > 0) {
  //       this.uploadedVideos = [];  // Clear previous images

  //       // Convert FileList to an array and create image previews
  //       Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           // Push the data URL (base64 string) into the uploadedImages array
  //           this.uploadedVideos.push({ path: reader.result as string });
  //         };
  //         reader.readAsDataURL(file);  // Read file as data URL for preview
  //       });
  //     } else {
  //       console.error('No files selected');
  //     }
  //   } else {
  //     console.error('No files in the input');
  //   }
  // }


  onVideoFileSelect(event: any): void {
    this.PropertyVideoOnFileClicked = true;
  
    if (event?.target?.files) {
      this.selectedPropertyVideoFiles = event.target.files;
  
      if (this.selectedPropertyVideoFiles && this.selectedPropertyVideoFiles.length > 0) {
        this.uploadedVideos = [];  // Clear previous videos
  
        // Convert FileList to an array and process each file
        Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
          // Check if the file size is less than 2048KB (2MB = 2048KB)
          const fileSizeKB = file.size / 1024; // Convert bytes to KB
  
          if (fileSizeKB < 2048) { // 2MB = 2048KB
            const reader = new FileReader();
            reader.onload = () => {
              // Push the data URL (base64 string) into the uploadedVideos array
              this.uploadedVideos.push({ path: reader.result as string });
            };
            reader.readAsDataURL(file);  // Read file as data URL for preview
          } else {
            // Show a popup alert when the file size is too large
            this.PropertyVideoOnFileClicked = false;
            alert(`File ${file.name} is too large and will not be uploaded. Maximum size allowed is 2MB.`);
          }
        });
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }
  
  // onDocumentFileSelect(event: any): void {
  //   this.PropertyDocumentOnFileClicked=true;
  //   if (event?.target?.files) {
  //     this.selectedPropertyDocumentFiles = event.target.files;

  //     if (this.selectedPropertyDocumentFiles && this.selectedPropertyDocumentFiles.length > 0) {
  //       this.uploadedDocuments = [];  // Clear previous images

  //       // Convert FileList to an array and create image previews
  //       Array.from(this.selectedPropertyDocumentFiles).forEach((file: File) => {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           const unsafeUrl = reader.result as string;  // Base64 data URL
  //           const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);  // Sanitize URL
  
  //           // Push the sanitized URL (SafeResourceUrl) and the File object
  //           this.uploadedDocuments.push({ path: unsafeUrl, DocumentPath: safeUrl });
  //         };
  //         reader.readAsDataURL(file);  // Read file as data URL for preview
  //       });
  //     } else {
  //       console.error('No files selected');
  //     }
  //   } else {
  //     console.error('No files in the input');
  //   }
  // }

  onDocumentFileSelect(event: any): void {
    this.PropertyDocumentOnFileClicked = true;
  
    if (event?.target?.files) {
      this.selectedPropertyDocumentFiles = event.target.files;
  
      if (this.selectedPropertyDocumentFiles && this.selectedPropertyDocumentFiles.length > 0) {
        this.uploadedDocuments = [];  // Clear previous documents
  
        // Convert FileList to an array and process each file
        Array.from(this.selectedPropertyDocumentFiles).forEach((file: File) => {
          // Check if the file size is less than 2048KB (2MB = 2048KB)
          const fileSizeKB = file.size / 1024; // Convert bytes to KB
  
          if (fileSizeKB < 2048) { // 2MB = 2048KB
            const reader = new FileReader();
            reader.onload = () => {
              const unsafeUrl = reader.result as string;  // Base64 data URL
              const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);  // Sanitize URL
  
              // Push the sanitized URL (SafeResourceUrl) and the File object
              this.uploadedDocuments.push({ path: unsafeUrl, DocumentPath: safeUrl });
            };
            reader.readAsDataURL(file);  // Read file as data URL for preview
          } else {
            // Show a popup alert when the file size is too large
            this.PropertyDocumentOnFileClicked = false;
            this.propertyInsStatus = `Document file ${file.name} is too large and will not be uploaded. Maximum size allowed is 2MB.`;
            this.isUpdateModalOpen = true;
            
          }
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
    this.fetchAminities();
    this.loadCountries();
    this.getPropertTypes();
  }

  DeActivateproperty(propertyID: string): void {
    this.propID = propertyID;
    const Status="0";
    this.updatePropertyIsActiveStatus(this.propID,Status);
  }

  Activateproperty(propertyID: string): void {
    this.propID = propertyID;
    const Status="1";
    this.updatePropertyIsActiveStatus(this.propID,Status);
  }

  updatePropertyIsActiveStatus(PropId: string, Status: string): void {
    this.http.put(`https://localhost:7190/api/Users/updatePropertyIsActiveStatus/${PropId}?Status=${Status}`, {}).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.propertyInsStatus = "Property IsActive Status updated successfully!";
          this.isUpdateModalOpen = true;

          this.fetchProperties();
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Updating Property.";
        this.isUpdateModalOpen = true;
        console.error("Error details:", error);
      }
    });
  }

  getTotalPropertyDet(propID: string): void {
    this.http.get(`https://localhost:7190/api/Users/GetOnlyPropertyDetailsById/${propID}`).subscribe((response: any) => {
      this.UserIDDb=response.userID;
      const convertToDDMMYYYY = (dateStr: string): string => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const convertToYYYYMMDD = (dateStr: string): string => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;  // yyyy-MM-dd format
      };
  
      const formattedPossessionDate = convertToDDMMYYYY(response.possessionDate);
      const formattedListDate = convertToDDMMYYYY(response.listDate);

      const formattedPossessionDateForInput = convertToYYYYMMDD(response.possessionDate); // For input type="date"
      const formattedListDateForInput = convertToYYYYMMDD(response.listDate); // For input type="date"

      const selectedAmenitiesString = response.aminities || '';
      this.selectedAmenities = selectedAmenitiesString.split(',')
  .map((amenity: string): Amenity => {
    const [id, name] = amenity.trim().split(' - ');  // Split by " - " to get id and name
    return { id, name };  // Return as an object of type Amenity
  })
  .filter((amenity: Amenity) => amenity.id && amenity.name);
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
        PossessionDate: formattedPossessionDateForInput,
        ListDate: formattedListDateForInput,
        Description: response.description,
        SpecificDescription: response.specificDescription,
        WebsiteUrl: response.websiteurl,
        Pinteresturl: response.pinteresturl,
        Facebookurl: response.facebookurl,
        Twitterurl: response.twitterurl,
        GoogleLocationurl: response.googleLocationurl,
        AvailabilityOptions: response.availabilityOptions
      });

      // Set the selected country, state, and city
      this.selectedCountry = response.country;
      this.selectedState = response.state;
      this.selectedCity = response.city;

      // Now load the states and cities for the selected country/state
      this.loadStates();  // Load states based on the selected country
      this.loadCities();  // Load cities based on the selected state

    }, error => {
      console.error('Error fetching property details:', error);
    });
  }

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);  // Resolve with Base64 string
      reader.onerror = reject;  // Reject on error
      reader.readAsDataURL(blob);  // Convert the Blob to Base64
    });
  }

  submitpropertyDet(){
    const selectedAmenitiesString = this.selectedAmenities
  .map(amenity => `${amenity.id} - ${amenity.name}`)  // Convert each object to "id - name"
  .join(',');
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
      aminities:selectedAmenitiesString,

      websiteurl:new String(this.propertyform.get('WebsiteUrl')?.value).toString() || null,
      Pinteresturl:new String(this.propertyform.get('Pinteresturl')?.value).toString() || null,
      Facebookurl:new String(this.propertyform.get('Facebookurl')?.value).toString() || null,
      Twitterurl:new String(this.propertyform.get('Twitterurl')?.value).toString() || null,
      GoogleLocationurl:new String(this.propertyform.get('GoogleLocationurl')?.value).toString() || null,
      availabilityOptions:new String(this.propertyform.get('AvailabilityOptions')?.value).toString(),
      userID:new String(localStorage.getItem('email')).toString(),
      ActiveStatus:"0",
      CountryName:(this.SelectedCountryName).toString(),
      StateName:(this.SelectedStateName).toString(),
      CityName:(this.SelectedCityName).toString(),
      PropActiveStatus:"1",
      PropertyTypeName:(this.SelectedPropertyTypeName).toString()
    };

    console.log(data);
    this.http.post("https://localhost:7190/api/Users/inspropertysample", data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if(response.statusCode=="200"){
          this.propertyInsStatus = "Property submitted successfully!";
          this.isUpdateModalOpen = true;
          this.editclicked = false;
          this.addnewPropertyclicked = false;
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Inserting Property.";
        this.isUpdateModalOpen = true;
        console.error("Error details:", error);
      }
      // complete: () => {
      //   // Log when the request completes
      //   console.log("Request completed");
      // }
    });
  }


  UserIDDb:any='';
  updatePropertyDet() {
    const selectedAmenitiesString = this.selectedAmenities
  .map(amenity => `${amenity.id} - ${amenity.name}`)  // Convert each object to "id - name"
  .join(',');
    const data = {
      id: 0,
      propID: this.propertyform.get('id')?.value,
      propname: this.propertyform.get('PropertyTitle')?.value || '',
      developedby: this.propertyform.get('DevelopedBy')?.value || '',
      mobileNumber:new String(this.propertyform.get('MobileNumber')?.value).toString() || '',
      emailID:new String(this.propertyform.get('EmailID')?.value).toString() || '',
      address:new String(this.propertyform.get('Address')?.value).toString() || '',
      landMark:this.propertyform.get('LandMark')?.value || '',
      country:new String(this.propertyform.get('Country')?.value).toString() || '',
      state:new String(this.propertyform.get('State')?.value).toString() || '',
      City:this.propertyform.get('City')?.value || '',
      NearBy:this.propertyform.get('NearBy')?.value || '',
      ZIPCode:new String(this.propertyform.get('PostalCode')?.value).toString() || '',
      ReraCertificateNumber:this.propertyform.get('CertificateNumber')?.value || '',
      PropertyApprovedBy:this.propertyform.get('PropertyApprovedBy')?.value || '',
      PropertyType:new String(this.propertyform.get('PropertyType')?.value).toString() || '',
      PropertyFor:new String(this.propertyform.get('PropertyFor')?.value).toString() || '',
      PropertyStatus:new String(this.propertyform.get('PropertyStatus')?.value).toString() || '',
      PropertyFacing:new String(this.propertyform.get('PropertyFacing')?.value).toString() || '',
      TotalBlocks:new String(this.propertyform.get('TotalBlocks')?.value).toString() || '',
      TotalFloors:new String(this.propertyform.get('TotalFloors')?.value).toString() || '',
      NoOfFlats:new String(this.propertyform.get('TotalNoOfFlats')?.value).toString() || '',
      BlockName:this.propertyform.get('BlockName')?.value || '',
      PropertyOnWhichFloor:new String(this.propertyform.get('PropertyOnWhichFloor')?.value).toString() || '',
      NoOfBedrooms:new String(this.propertyform.get('NumberofBedrooms')?.value).toString() || '',
      NoOfBathrooms:new String(this.propertyform.get('NumberofBathrooms')?.value).toString() || '',
      NoOfBalconies:new String(this.propertyform.get('NumberofBalconies')?.value).toString() || '',
      NoOfParkings:new String(this.propertyform.get('NumberofParkings')?.value).toString() || '',
      AreaType:new String(this.propertyform.get('AreaType')?.value).toString() || '',
      TotalArea:new String(this.propertyform.get('TotalArea')?.value).toString() || '',
      CarpetArea:new String(this.propertyform.get('CarpetArea')?.value).toString() || '',
      PriceFor:new String(this.propertyform.get('PriceFor')?.value).toString() || '',
      PropertyTotalPrice:new String(this.propertyform.get('PropertyTotalPrice')?.value).toString() || '',
      AmenitiesCharges:new String(this.propertyform.get('AmenitiesCharges')?.value).toString() || '',
      MaintenanceCharges:new String(this.propertyform.get('MaintenanceCharges')?.value).toString() || '',
      CorpusFund:new String(this.propertyform.get('CorpusFund')?.value).toString() || '',
      BuildYear:new String(this.propertyform.get('BuildYear')?.value).toString() || '',
      PossessionDate:new Date(this.propertyform.get('PossessionDate')?.value).toISOString() || '',
      ListDate:new Date(this.propertyform.get('ListDate')?.value).toISOString() || '',

      description:new String(this.propertyform.get('Description')?.value).toString() || '',
      specificDescription:new String(this.propertyform.get('SpecificDescription')?.value).toString() || '',
      aminities:selectedAmenitiesString,

      websiteurl:new String(this.propertyform.get('WebsiteUrl')?.value).toString() || '',
      Pinteresturl:new String(this.propertyform.get('Pinteresturl')?.value).toString() || '',
      Facebookurl:new String(this.propertyform.get('Facebookurl')?.value).toString() || '',
      Twitterurl:new String(this.propertyform.get('Twitterurl')?.value).toString() || '',
      GoogleLocationurl:new String(this.propertyform.get('GoogleLocationurl')?.value).toString() || '',
      availabilityOptions:new String(this.propertyform.get('AvailabilityOptions')?.value).toString() || '',
      userID:(this.UserIDDb).toString(),
      ActiveStatus:'',
      CountryName:(this.SelectedCountryName).toString(),
      StateName:(this.SelectedStateName).toString(),
      CityName:(this.SelectedCityName).toString(),
      PropActiveStatus:"",
      PropertyTypeName:(this.SelectedPropertyTypeName).toString()
    };
  
    if (!this.propID || this.propID.trim() === '') {
      console.error("Invalid propID");
      return;
    }
  
    this.http.put(`https://localhost:7190/api/Users/updatePropertyDet/${this.propID}`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.propertyInsStatus = "Property updated successfully!";
          this.isUpdateModalOpen = true;
          this.editclicked = false;
          this.addnewPropertyclicked = false;
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Updating Property.";
        this.isUpdateModalOpen = true;
        console.error("Error details:", error);
      }
    });
  }

  addNewProperty(){
    this.addnewPropertyclicked=true;
    this.editclicked=false;
    this.generatePropertyID();
    this.loadCountries();
    this.loadStates();
    this.loadCities();
    this.fetchAminities();
    this.getPropertTypes();
  }

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
  searchQuery: string = ""; // Variable to hold the search query


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

  backclick(event: Event): void {
    event.preventDefault();
    
    if (this.editclicked || this.addnewPropertyclicked) {
      this.editclicked = false;
      this.addnewPropertyclicked=false;
      this.fetchProperties();
    }
  }

  declineProperty(){
    const PropId=this.propertyform.get('id')?.value
    this.updatePropertyStatus(PropId,'2');
  }

  ApproveProperty(){
    const PropId=this.propertyform.get('id')?.value
    this.updatePropertyStatus(PropId,'1');
  }


    // Select all amenities
    selectAll(): void {
      this.selectedAmenities = this.amenities.map(amenity => ({
        id: amenity.aminitieID,
        name: amenity.name
      }));
      console.log('All amenities selected:', this.selectedAmenities);
    }
  
    deselectAll(): void {
      this.selectedAmenities = [];
      console.log('All amenities deselected');
    }

  updatePropertyStatus(PropId: string, Status: string): void {
    this.http.put(`https://localhost:7190/api/Users/updatePropertyStatus/${PropId}?Status=${Status}`, {}).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.propertyInsStatus = "Property Status updated successfully!";
          this.isUpdateModalOpen = true;
          this.editclicked = false;
          this.addnewPropertyclicked = false;
          this.fetchProperties();
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Updating Property.";
        this.isUpdateModalOpen = true;
        console.error("Error details:", error);
      }
    });
  }

  getPropertyDetailsByStatus(status: string): void {
    
    this.http.get(`https://localhost:7190/api/Users/GetPropertiesByStatus?status=${status}`)
      .subscribe((response: any) => {
  
        // Map the response to extract only the propID, propname, developedby, and status fields
        this.properties = response.map((property: any) => {
          // Determine the PropertyStatus based on the activeStatus of the property
          let PropertyStatus: string = '';
  
          if (property.activeStatus === "2") {
            PropertyStatus = "Not Approved";
          } else if (property.activeStatus === "1") {
            PropertyStatus = "Approved";
          } else if (property.activeStatus === "0") {
            PropertyStatus = "Pending";
          }
          else{
            
          }
  
          return {
            propID: property.propID,            // Adjust field names if necessary
            propname: property.propname,
            developedby: property.developedby,
            status: PropertyStatus              // Add the computed status
          };
        });
  
        console.log('Mapped properties:', this.properties);
      }, error => {
        console.error('Error fetching properties:', error);
      });
  }
  

  
  selectedWhoseProperties: string = '0';
  selectedPropertyStatus1: string = '';
  selectedIsActiveStatus1:string='';
  userID: string = localStorage.getItem('email') || '';
  filteredPropertiesNotNull:boolean=false;


  PropertyIsActiveStatusNotActive:boolean=false;
  // Method to fetch filtered properties
  fetchFilteredProperties(whose: string, status: string,IsActivestatus:string, search: string): void {
    const url = `https://localhost:7190/api/Users/GetFilteredProperties?whose=${whose}&status=${status}&IsActivestatus=${IsActivestatus}&search=${search}&UserID=${this.userID}`;
    this.http.get(url).subscribe((response: any) => {
      if (response.statusCode === 200) {
        this.properties = response.data.map((property: any) => ({
          propID: property.propID,
          propname: property.propname,
          developedby: property.developedby,
          status: this.getPropertyStatus(property.activeStatus),
          IsActiveStatus:this.getPropertyIsActiveStatus(property.propActiveStatus),
          IsActiveStatusBoolean:property.propActiveStatus
          
        }));
        this.properties.forEach(property => {
          console.log(property.IsActiveStatusBoolean); 
        });
        //this.PropertyIsActiveStatusNotActive = this.properties.some(property => property.IsActiveStatus === "1");

        console.log(this.PropertyIsActiveStatusNotActive);
        this.filteredPropertiesNotNull=false;
      } else if (response.statusCode === 404) {
        console.log(response);
        this.filteredPropertiesNotNull=true;
        console.error(response.Message);
      } else {
        console.error('Unexpected response status:', response.StatusCode);
        this.properties = [];
      }
    }, error => {
      console.error('Error fetching properties:', error);
      this.filteredPropertiesNotNull = true;
      this.properties = [];
    });
  }

  // fetchFilteredProperties(whose: string, status: string, search: string): void {
  //   let url = `https://localhost:7190/api/Users/GetFilteredProperties?whose=${whose}&status=${status}&UserID=${this.userID}`;
  
  //   // Only append search if it's not an empty string
  //   if (search) {
  //     url += `&search=${encodeURIComponent(search)}`;
  //   }
  
  //   this.http.get(url).subscribe({
  //     next: (response: any) => {
  //       console.log('API Response:', response);  // Log the full response to inspect it
  
  //       if (response.statusCode === 200) {
  //         // Successfully retrieved properties
  //         this.properties = response.data.map((property: any) => ({
  //           propID: property.propID,
  //           propname: property.propname,
  //           developedby: property.developedby,
  //           status: this.getPropertyStatus(property.ActiveStatus)  // Ensure ActiveStatus is handled correctly
  //         }));
  //         this.filteredPropertiesNotNull = false;
  //       } else {
  //         console.error('Unexpected response status:', response.statusCode);
  //         this.properties = [];
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching properties:', error);
        
  //       console.error('Error Message:', error.message);
  //       console.error('Error Status:', error.status);
  //       console.error('Error StatusText:', error.statusText);
  //       console.error('Error Response:', error.error);
  //     }
  //   });
  // }
  
  

  // Handle whose properties filter
  onWhosePropertySelectionChange(event: any): void {
    this.selectedWhoseProperties = event.target.value;
    this.applyFilters();
  }

  // Handle status filter
  // onWhosePropertyStatusSelectionChange(event: any): void {
  //   let selectedStatus='';
  //   selectedStatus = event.target.value;
  //   console.log(selectedStatus);
  //   if(selectedStatus=="1"){
  //     this.selectedPropertyStatus1==selectedStatus;
  //   }
  //   else if(selectedStatus=="2"){
  //     this.selectedPropertyStatus1==selectedStatus;
  //   }
  //   else if(selectedStatus=="3"){
  //     this.selectedIsActiveStatus1==selectedStatus;
  //   }
  //   else if(selectedStatus=="4"){
  //     this.selectedIsActiveStatus1==selectedStatus;
  //   }
  //   else{
  //     this.selectedPropertyStatus1=='0';
  //   }
  //   this.applyFilters();
  // }

  onWhosePropertyStatusSelectionChange(event: any): void {
    let selectedStatus = event.target.value;
  
    // Clear both property status and active/inactive status if "Latest" is selected
    if (selectedStatus == "0") {
      this.selectedPropertyStatus1 = '0';  // Latest status
      this.selectedIsActiveStatus1 = '';  // Reset Active/Inactive filter
    } 
    // Handle Approved (1) and Declined (2) statuses
    else if (selectedStatus == "1" || selectedStatus == "2") {
      this.selectedPropertyStatus1 = selectedStatus;  // Set to Approved or Declined
      this.selectedIsActiveStatus1 = '';  // Clear Active/Inactive filter
    } 
    // Handle Active (3) and InActive (4) statuses
    else if (selectedStatus == "3") {
      this.selectedIsActiveStatus1 = "1";  // Set Active/Inactive
      this.selectedPropertyStatus1 = '';  // Clear general property status
    }

    else if (selectedStatus == "4") {
      this.selectedIsActiveStatus1 = "0";  // Set Active/Inactive
      this.selectedPropertyStatus1 = '';  // Clear general property status
    }
  
    // After setting the correct values, apply filters to fetch filtered properties
    this.applyFilters();
  }
  

  // Apply all filters together
  applyFilters(): void {
    this.fetchFilteredProperties(this.selectedWhoseProperties, this.selectedPropertyStatus1, this.selectedIsActiveStatus1, this.searchQuery);
  }

  // Handle search query change
  onSearchChange(): void {
    this.applyFilters();
  }

  // Convert active status to a readable status
  getPropertyStatus(activeStatus: string): string {
    switch (activeStatus) {
      case '1': return 'Approved';
      case '2': return 'Declined';
      case '0': return 'Pending';
      default: return 'Unknown';
    }
  }

  getPropertyIsActiveStatus(IsActiveStatus: string): string {
    switch (IsActiveStatus) {
      case '1': return 'Active';
      case '0': return 'Not Active';
      default: return 'Unknown';
    }
  }

  isUpdateModalOpen:boolean = false;
  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }

  // Handle "OK" button click
  handleOk() {
    this.UpdatecloseModal();
    // Execute your actions
    if(!this.propertyImagesClicked && !this.propertyFloorImagesClicked && !this.propertyVideosClicked && !this.propertyDocumentsClicked){
      this.editclicked = false;
      this.addnewPropertyclicked = false;
      this.fetchProperties();
    }
    
  }

  // clearContent(editorId: string): void {
  //   this.propertyform.get('Description')?.setValue('');
  //   this.propertyform.get('SpecificDescription')?.setValue('');

  //   const quillEditor = document.getElementById(editorId) as any;
  //   if (quillEditor && quillEditor.__quill) {
  //     quillEditor.__quill.root.innerHTML = '';
  //   }
  // }

  

  clearContent(editorId: string): void {
    if (editorId === 'Description') {
      this.propertyform.controls['Description'].setValue('');
      const quillEditor = document.getElementById('Description') as any;
      if (quillEditor && quillEditor.__quill) {
        quillEditor.__quill.root.innerHTML = '';  
      }
    } else if (editorId === 'SpecificDescription') {
      this.propertyform.controls['SpecificDescription'].setValue('');
      const quillEditor = document.getElementById('SpecificDescription') as any;
      if (quillEditor && quillEditor.__quill) {
        quillEditor.__quill.root.innerHTML = '';  
      }
    }
  }
  




  // makeImageDefault(propID: string, imageID: number) {
  //   // Find the image by matching imageID with the image id in the array
  //   const selectedImage = this.uploadedImages1.find(img => img.id === imageID);
  
  //   if (selectedImage) {
  //     // Set the selected image as default
  //     selectedImage.DefaultImage = "1"; // "1" means default image
  
  //     // Set all other images' DefaultImage to "0"
  //     this.uploadedImages1.forEach(img => {
  //       if (img.id !== imageID) {
  //         img.DefaultImage = "0"; // "0" means not a default image
  //       }
  //     });
  
  //     // Reorder the array to ensure the default image appears first
  //     this.uploadedImages1 = [
  //       selectedImage, 
  //       ...this.uploadedImages1.filter(img => img.id !== imageID)
  //     ];
  
  //     // Update the database to reflect the change (update the default image)
  //     this.updateDefaultImageInDatabase(propID, imageID);
  //   }
  // }
  
  // updateDefaultImageInDatabase(propID: string, imageID: number) {
  //   console.log("selected ImageID:",imageID);
  //   this.http.put(`https://localhost:7190/api/Users/update-default-image/${propID}/${imageID}`, {})
  //     .subscribe(response => {
  //       console.log('Default image updated successfully');
  //     }, error => {
  //       console.error('Error updating default image:', error);
  //     });
  // }


  makeImageDefault(propID: string, imageID: number) {
    // Find the image by matching imageID with the image id in the array
    const selectedImage = this.uploadedImages1.find(img => img.id === imageID);
  
    if (selectedImage) {
      // Set the selected image as default
      selectedImage.DefaultImage = "1"; // "1" means default image
  
      // Set all other images' DefaultImage to "0"
      this.uploadedImages1.forEach(img => {
        if (img.id !== imageID) {
          img.DefaultImage = "0"; // "0" means not a default image
        }
      });
  
      // Reorder the array to ensure the default image appears first (if required)
      this.uploadedImages1 = [
        selectedImage, 
        ...this.uploadedImages1.filter(img => img.id !== imageID)
      ];
  
      // Update the database to reflect the change (update the default image)
      this.updateDefaultImageInDatabase(propID, imageID);
    }
  }
  
  updateDefaultImageInDatabase(propID: string, imageID: number) {
    console.log("selected ImageID:", imageID);
    this.http.put(`https://localhost:7190/api/Users/update-default-image/${propID}/${imageID}`, {})
      .subscribe(response => {
        console.log('Default image updated successfully');
      }, error => {
        console.error('Error updating default image:', error);
      });
  }
  
  // submitCustomOrder() {
  //   // Ensure each image has a valid custom order before submitting
  //   this.uploadedImages1.forEach((image, index) => {
  //     // Set the ImageOrder field based on the custom order input
  //     image.ImageOrder = image.customOrder || index + 1; // Default to index+1 if customOrder is undefined
  //   });
  
  //   // Send the updated image order and default image data to the server
  //   this.updateImageOrderInDatabase();
  // }
  
  // updateImageOrderInDatabase() {
  //   // Send the updated order and default image data to the server
  //   const updatedImages = this.uploadedImages1.map(img => ({
  //     id: img.id,
  //     imageOrder: img.ImageOrder,
  //     defaultImage: img.DefaultImage
  //   }));
  
  //   this.http.put(`https://localhost:7190/api/Users/update-image-order-and-default/${this.propID}`, updatedImages)
  //     .subscribe(response => {
  //       console.log('Image order and default image updated successfully');
  //     }, error => {
  //       console.error('Error updating image order and default image:', error);
  //     });
  // }

  submitCustomOrder() {
    // Prepare the payload with the custom order and default image info
    const updatedImages = this.uploadedImages1.map(image => ({
      id: image.id,
      imageOrder: image.customOrder.toString(),  // Ensure it's a string
      defaultImage: image.DefaultImage === "1" ? "1" : "0"  // Set default to "1" or "0"
    }));

    console.log('Updated images payload:', updatedImages);  // Verify the payload before sending

    this.updateImageOrderInDatabase(updatedImages);
  }
  
  
  updateImageOrderInDatabase(updatedImages: any[]) {
    this.http.put(`https://localhost:7190/api/Users/update-image-order-and-default/${this.propID}`, updatedImages)
      .subscribe(
        response => {
          console.log('Image order and default image updated successfully');
        },
        error => {
          console.error('Error updating image order and default image:', error);
        }
      );
  }


  submitFloorImagesCustomOrder() {
    // Prepare the payload with the custom order and default image info
    const updatedImages = this.uploadedFloorImages1.map(image => ({
      id: image.id,
      imageOrder: image.customOrder.toString(),  // Ensure it's a string
      defaultImage: image.DefaultImage === "1" ? "1" : "0"  // Set default to "1" or "0"
    }));

    console.log('Updated images payload:', updatedImages);  // Verify the payload before sending

    this.updateFloorImageOrderInDatabase(updatedImages);
  }
  
  
  updateFloorImageOrderInDatabase(updatedImages: any[]) {
    this.http.put(`https://localhost:7190/api/Users/update-floor-image-order-and-default/${this.propID}`, updatedImages)
      .subscribe(
        response => {
          console.log('Image order and default image updated successfully');
        },
        error => {
          console.error('Error updating image order and default image:', error);
        }
      );
  }
  
  
  
  
  
  
  

  areaValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (typeof value === 'number' && value >= 1500 && value <= 3500) {
      return null; // Valid area if between 1500 and 3500
    }
    return { invalidArea: true }; // Invalid area value
  }

  // Custom validator for PriceFor field to handle single value or range
  priceForValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    // Check if it's a single number
    if (typeof value === 'number') {
      return null; // Valid single price
    }

    // Check if it's a valid range like '5000-7000'
    const priceRangePattern = /^\d{4,5}-\d{4,5}$/; // Regex for price range (e.g., 5000-7000)
    if (priceRangePattern.test(value)) {
      return null; // Valid price range
    }

    return { invalidPrice: true }; // Invalid price value
  }

  calculateTotalPrice() {
    const totalArea = this.propertyform.get('TotalArea')?.value;
    const priceFor = this.propertyform.get('PriceFor')?.value;

    // Initializing variables for minimum and maximum values.
    let totalAreaMin = 0;
    let totalAreaMax = 0;
    let priceForMin = 0;
    let priceForMax = 0;

    // Handle TotalArea: Check if it's a range (e.g., "1500-3500") or a single number
    if (totalArea && typeof totalArea === 'string' && totalArea.includes('-')) {
        // Split the range by '-' and convert to numbers
        const [minArea, maxArea] = totalArea.split('-').map(Number);
        totalAreaMin = minArea;
        totalAreaMax = maxArea;
    } else if (totalArea && !isNaN(totalArea)) {
        totalAreaMin = totalArea;       // If it's a single value, use it for both min and max
        totalAreaMax = totalArea;
    }

    // Handle PriceFor: Check if it's a range (e.g., "4500-5000") or a single number
    if (priceFor && typeof priceFor === 'string' && priceFor.includes('-')) {
        // Split the range by '-' and convert to numbers
        const [minPrice, maxPrice] = priceFor.split('-').map(Number);
        priceForMin = minPrice;
        priceForMax = maxPrice;
    } else if (priceFor && !isNaN(priceFor)) {
        priceForMin = priceFor;        // If it's a single value, use it for both min and max
        priceForMax = priceFor;
    }

    // If the total area and price range is valid, calculate the total price
    if (!isNaN(totalAreaMin) && !isNaN(priceForMin) && totalAreaMin > 0 && priceForMin > 0) {
        const totalPriceMin = totalAreaMin * priceForMin;
        const totalPriceMax = totalAreaMax * priceForMax;

        // If both min and max prices are valid, show the range
        if (totalPriceMin !== totalPriceMax) {
            this.propertyform.get('PropertyTotalPrice')?.setValue(`${totalPriceMin}-${totalPriceMax}`);
        } else {
            this.propertyform.get('PropertyTotalPrice')?.setValue(`${totalPriceMin}`);
        }
    } else {
        this.propertyform.get('PropertyTotalPrice')?.setValue(''); // Show empty if invalid
    }
}







// calculateTotalPrice() {
//   const totalArea = this.propertyform.get('TotalArea')?.value;
//   const priceFor = this.propertyform.get('PriceFor')?.value;

//   let totalAreaMin = 0;
//   let totalAreaMax = 0;
//   let priceForMin = 0;
//   let priceForMax = 0;

//   // Handle TotalArea: Check if it's a range (e.g., "1230-1500") or a single number
//   if (totalArea && typeof totalArea === 'string' && totalArea.includes('-')) {
//       // Split the range by '-' and convert to numbers
//       const [minArea, maxArea] = totalArea.split('-').map(Number);
//       totalAreaMin = minArea;
//       totalAreaMax = maxArea;
//   } else if (totalArea && typeof totalArea === 'number') {
//       totalAreaMin = totalArea;
//       totalAreaMax = totalArea; // If it's a single value, use it for both min and max
//   }

//   // Handle PriceFor: Check if it's a range (e.g., "5000-7000") or a single number
//   if (priceFor && typeof priceFor === 'string' && priceFor.includes('-')) {
//       // Split the range by '-' and convert to numbers
//       const [minPrice, maxPrice] = priceFor.split('-').map(Number);
//       priceForMin = minPrice;
//       priceForMax = maxPrice;
//   } else if (priceFor && typeof priceFor === 'number') {
//       priceForMin = priceFor;
//       priceForMax = priceFor; // If it's a single value, use it for both min and max
//   }

//   // Calculate the minimum and maximum total prices
//   const minTotalPrice = totalAreaMin * priceForMin;
//   const maxTotalPrice = totalAreaMax * priceForMax;

//   // Set the PropertyTotalPrice as a range
//   if (minTotalPrice > 0 && maxTotalPrice > 0) {
//       this.propertyform.get('PropertyTotalPrice')?.setValue(`${minTotalPrice}-${maxTotalPrice}`);
//   } else {
//       this.propertyform.get('PropertyTotalPrice')?.setValue('');
//   }
// }


  
  // get formControls() {
  //   return this.propertyform.controls;
  // }
}
