import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuillModule,QuillEditorComponent } from 'ngx-quill';
import { ApiServicesService } from '../../../api-services.service';


interface Amenity {
  id: string;
  name: string;
  icon:string;
}

@Component({
  selector: 'app-add-property-component',
  standalone: true,
  providers: [ApiServicesService],
  imports: [ReactiveFormsModule,FormsModule,HttpClientModule,QuillModule,NgIf,NgFor,NgClass],
  templateUrl: './add-property-component.component.html',
  styleUrl: './add-property-component.component.css'
})
export class AddPropertyComponentComponent implements OnInit {
  isModalOpen: any;
  isVideoModalOpen:any;
  isDocumnetModalOpen:any;
  PropertyInsUpdateStatus:string="";
  initialFormData: any;
  isUpdateButtonEnabled: boolean = false;
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
  SelectedCountryName: string|null=null;
  SelectedStateName:string|null=null;
  SelectedCityName:string|null=null;
  SelectedPropertyTypeName:string|null=null;
  editclicked: boolean = false;
  addnewPropertyclicked:boolean=false;
  properties: Array<{ propID: string, propname: string, developedby: string, status: string, IsActiveStatus: string,IsActiveStatusBoolean:string,SaleStatus:string }> = [];
  propertyInsStatus: any = '';
  propID: string = '';
  selectedPropertyFiles: FileList | null = null;
  selectedPropertyFloorFiles: FileList | null = null;
  selectedPropertyVideoFiles: FileList | null = null;
  selectedPropertyDocumentFiles:FileList | null = null;
  uploadedImages: Array<{ path: string; customOrder: number }> = [];
  uploadedFloorImages:Array<{ path: string }> = [];
  uploadedVideos:Array<{ path: string }> = [];
  uploadedDocuments:Array<{ path: string,DocumentPath:SafeResourceUrl }> = [];
  selectedImage: string = '';
  seletedVideo:string='';
  selecteddocumnet:string='';
  isUpdateModalOpen:boolean = false;
  selectedWhoseProperties: string = '';
  selectedPropertyStatus1: string = '';
  selectedIsActiveStatus1:string='';
  propertySoldOutStatus1:string='';
  PropertySaleStatus: string = '';

  
  userID: string = localStorage.getItem('email') || '';
  filteredPropertiesNotNull:boolean=false;
  currentPage = 1;
  pageSize = 5; 
  searchQuery: string = ""; 
  visiblePageCount: number = 3; 
  isEditing = false;
  UserIDDb:any='';
  SoldOutProperty:boolean=false;
  propertyActiveStatus:boolean=false;
  PropertyOnfileClicked:boolean=false;
  PropertyFloorImageOnFileClicked:boolean=false;
  PropertyVideoOnFileClicked:boolean=false;
  PropertyDocumentOnFileClicked:boolean=false;
  propertyImagesUploadButtonClick:boolean=false;
  propertyfloorImagesUploadButtonClick:boolean=false;
  propertyVideoUploadButtonClick:boolean=false;
  propertydocumenetUploadButtonClick:boolean=false;
  propertyImagesUploadedSuccesful:boolean=false;
  propertyFloorImagesUploadedSuccesful:boolean=false;
  propertyVideosUploadedSuccesful:boolean=false;
  propertyDocumentsUploadedSuccesful:boolean=false;
  PropertyIsActiveStatusNotActive:boolean=false;
  selectedPropertyAreaId:string="";
  selectedPropertyFacingId:string="";
  selectedPropertystatusId:string="";
  selectedPropertyForId: string = "";
  selectedPropertyTypeId: string = "";
  selectedCountryId: string="";
  selectedStateId: string="";
  selectedCityId: string = "";


  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;

  constructor(public http:HttpClient,private cdRef: ChangeDetectorRef,private sanitizer: DomSanitizer,private apiurls: ApiServicesService){}
 
  ngOnInit(): void {
    this.propertyform.get('TotalArea')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.propertyform.get('PriceFor')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.fetchProperties();

    this.propertyform.valueChanges.subscribe(() => {
      this.isUpdateButtonEnabled = this.propertyform.dirty;
    });

    if(this.isUpdateButtonEnabled==true){
      this.isUpdateButtonEnabled=false;
    }
    else{
      this.isUpdateButtonEnabled=false;
    }
  }
 
  isFormModified() {
    return JSON.stringify(this.initialFormData) !== JSON.stringify(this.propertyform.value);
  }
  
  
  // generatePropertyID(){
  //   this.http.get("https://localhost:7190/api/Users/getautopropertyID", { responseType: 'text' }).subscribe((response: string) => {
  //     this.propID = response;
  //     this.propertyform.patchValue({ id: response });
  //   }, error => {
  //     console.error('Error fetching property ID:', error);
  //   });
  // }


  
    
  generatePropertyID(){
    // this.http.get("https://localhost:7190/api/Users/getautopropertyID", { responseType: 'text' }).subscribe((response: string) => {
    //   this.propID = response;
    //   this.propertyform.patchValue({ id: response });
    // }, error => {
    //   console.error('Error fetching property ID:', error);
    // });
    
    this.apiurls.get<string>('getautopropertyID', 'text').subscribe({
      next: (response) => {
        this.propID = response;
        this.propertyform.patchValue({ id: response });
      },
      error: (error) => {
        console.error('Error fetching property ID:', error);
      }
    });
    
  }
  // generatePropertyID() {
  //   this.apiurls.get<string>('getautopropertyID').subscribe({
  //     next: (response: string) => {
  //       this.propID = response;
  //       this.propertyform.patchValue({ id: response });
  //     },
  //     error: (error) => {
  //       console.error('Error fetching property ID:', error);
  //     }
  //   });
  // }
  
  
  fetchProperties(): void {
   this.apiurls.get<any>('GetAllPropertyDetails')
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
            PropertyIsActiveStatus = "InActive";
          }


          // let PropertySaleStatus: string = '';
          // if (property.propertySaleStatus === "1") {
          //   PropertySaleStatus = "Sold Out";
          // } else if (property.propertySaleStatus === "0") {
          //   PropertySaleStatus = "Unsold";
          // }
                let PropertySaleStatus: string = '';
                if (property.propertySaleStatus == 1 || property.propertySaleStatus == "1") {
                  PropertySaleStatus = "Sold Out";
                } else {
                  PropertySaleStatus = "Unsold";
                }


          return {
            propID: property.propID,
            propname: property.propname,
            developedby: property.developedby,
            status: PropertyStatus,
            IsActiveStatus:PropertyIsActiveStatus,
            IsActiveStatusBoolean:property.propActiveStatus,
            SaleStatus: PropertySaleStatus
          };
        });
      }, error => {
        console.error('Error fetching properties:', error);
      });
  }

  


  
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
    // , Validators.min(1), Validators.max(10)
    // TotalFloors: new FormControl('',[Validators.required]),
    TotalFloors: new FormControl('', [Validators.required,Validators.pattern('^[0-9]+$'),Validators.min(1)]),    
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
  
  uploadedImages1: Array<{ 
    id: number; 
    propID: string; 
    fileName: string; 
    mimeType: string; 
    imageData: Blob; 
    imageUrl: string; 
    DefaultImage: string; 
    ImageOrder: number;    
    customOrder: number; 
  }> = [];

  originalUploadedImages1: Array<{
    id: number;
    imageOrder: number;
    defaultImage: string;
  }> = [];
  
  uploadedFloorImages1: Array<{ 
    id: number; 
    propID: string; 
    fileName: string; 
    mimeType: string; 
    imageData: Blob; 
    imageUrl: string; 
    DefaultImage: string; 
    ImageOrder: number;     
    customOrder: number;    
  }> = [];

  originalUploadedFloorImages1: Array<{
    id: number;
    imageOrder: number;
    defaultImage: string;
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

  loadCountries(): void {
    this.apiurls.get<any>('Countries')
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
      this.apiurls.get<any>(`States/${this.selectedCountry}`)
        .subscribe({
          next: (data) => {
            this.states = data; 
           
          },
          error: (err) => {
            console.error('Failed to load states:', err);
          }
        });
    }
  }

  loadCities(): void {
    if (this.selectedState) {
      this.apiurls.get<any>(`cities/${this.selectedState}`)
        .subscribe({
          next: (data) => {
            this.cities = data;  
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
      this.selectedCountryId = selectElement.value; 
      const countryId = selectElement.value;
      this.selectedCountry = Number(countryId);
      const selectedCountry = this.countries.find(country => country.id === this.selectedCountry);
      if (selectedCountry) {
        this.SelectedCountryName = selectedCountry.name;
      }
      this.loadStates();  
    }
  }

 onStateChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  if (selectElement) {
    this.selectedStateId = selectElement.value;
    const stateId = selectElement.value;
    this.selectedState = Number(stateId);
    const selectedState = this.states.find(state => state.id === this.selectedState);
    if (selectedState) {
      this.SelectedStateName = selectedState.name;
    }
    this.loadCities();
  }
 }

 onCityChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  if (selectElement) {
    this.selectedCityId = selectElement.value;

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
    this.apiurls.get<any>('GetAllPropertyTypes')
      .subscribe((response: any) => {
        if (response && Array.isArray(response.data)) {
          this.propertytypes = response.data.map((data: any) => ({
            id: data.propertyTypeID,
            name: data.name,
            description: data.description
          }));
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
      this.selectedPropertyTypeId = selectElement.value;
      const PropertyTypeId = selectElement.value;
      this.selectedPropertyType = String(PropertyTypeId); 
      const selectedPropTypeName = this.propertytypes.find(propertytype => propertytype.id === this.selectedPropertyType);
      if (selectedPropTypeName) {
        this.SelectedPropertyTypeName = selectedPropTypeName.name;
      }
    }
  }

  onPropertyForChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      this.selectedPropertyForId = selectElement.value;

      const PropertyForId = selectElement.value;
      this.selectedPropertyFor = String(PropertyForId); 
    }
  }
 
  onPropertyStatusChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      this.selectedPropertystatusId = selectElement.value;

      const PropertyStatus = selectElement.value;
      this.selectedPropertyStatus = String(PropertyStatus); 
    }
  }
 
  onPropertyFacingChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      this.selectedPropertyFacingId = selectElement.value;

      const PropertyFacing = selectElement.value;
      this.selectedPropertyFacing = String(PropertyFacing); 
    }
  }

  onAreaTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    if (selectElement) {
      this.selectedPropertyAreaId = selectElement.value;
      const Areatype = selectElement.value;
      this.selectedAreaType = String(Areatype); 
    }
  }

  @ViewChild('PossessionDateInput')
  possessionDateInput!: ElementRef;
  @ViewChild('ListDateInput')
  listDateInput!: ElementRef;
  

    onFocus(inputId: string): void {
      const inputElement = inputId === 'PossessionDate' ? this.possessionDateInput.nativeElement : this.listDateInput.nativeElement;
      inputElement.setAttribute('type', 'date');
    }
  
    onBlur(inputId: string): void {
      const inputElement = inputId === 'PossessionDate' ? this.possessionDateInput.nativeElement : this.listDateInput.nativeElement;
  
      if (!inputElement.value) {
        inputElement.setAttribute('type', 'text');
      }
    }
  
  fetchAminities(): void {
    this.apiurls.get<any>('GetAllAminities')
      .subscribe((response: any) => {
        if (response && Array.isArray(response.data)) {
          this.amenities = response.data.map((data: any) => ({
            aminitieID: data.aminitieID,
            name: data.name,
            description: data.description,
            icon:data.aminitieIcon
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
  
    if (event.target.checked) {
      if (amenity.aminitieID && amenity.name && amenity.icon) {
        if (!this.selectedAmenities.some(item => item.id === amenity.aminitieID)) {
          this.selectedAmenities.push({ id: amenity.aminitieID, name: amenity.name,icon:amenity.icon });
        }
      }
    } else {
      const index = this.selectedAmenities.findIndex(item => item.id === amenity.aminitieID);
      if (index > -1) {
        this.selectedAmenities.splice(index, 1);
      }
    }
    this.selectedAmenities = this.selectedAmenities.filter(item => item.id && item.name && item.icon);
    console.log(this.selectedAmenities);
  }

  propertyImagesClick(){
    this.propertyImagesClicked=true;
    this.propertyFloorImagesClicked=false;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=false;
    // const propID:string=(this.propertyform.get('id')?.value).toString();
    // this.getPropertyImagesForProperty(propID);

    if (!this.hasImageListChanged()) {
      const propID: string = (this.propertyform.get('id')?.value).toString();
      this.getPropertyImagesForProperty(propID);
    } else {
      console.log("Images have changed — skipping refresh.");
    }
  }
  
  propertyFloorImagesClick(){
    this.propertyImagesClicked=false;
    this.propertyFloorImagesClicked=true;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=false;
    // const propID:string=(this.propertyform.get('id')?.value).toString();
    // this.getPropertyFloorImagesForProperty(propID);
    if (!this.hasFloorImageListChanged()) {
      const propID: string = (this.propertyform.get('id')?.value).toString();
      this.getPropertyFloorImagesForProperty(propID);
    } else {
      console.log("Floor images have changed — skipping refresh.");
    }
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
    if (!this.propID || !this.selectedPropertyFiles || this.selectedPropertyFiles.length === 0) {
      alert('Property ID is required and you must select images.');
      this.propertyImagesUploadButtonClick = false; 
      return;
  }
  const formData = new FormData();
  formData.append('propID', this.propID);
  const CreatedBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('createdBy', CreatedBy); 
  
  Array.from(this.selectedPropertyFiles).forEach((file: File) => {
      formData.append('images', file, file.name);
  });

 this.apiurls.post<any>('uploadPropertyImages', formData).subscribe(
      response => {
        this.PropertyOnfileClicked=false;
        this.propertyImagesUploadButtonClick=false;
        this.getPropertyImagesForProperty(this.propID); 
        const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';  
    }
      },
      error => {
          console.error('Upload failed:', error);
          this.propertyImagesUploadButtonClick = false;
      }
  );
}

 uploadPropertyFloorImages(): void {
  this.propertyfloorImagesUploadButtonClick = true;
  if (!this.propID || !this.selectedPropertyFloorFiles || this.selectedPropertyFloorFiles.length === 0) {
      console.error('Property ID is required and you must select images.');
      this.propertyfloorImagesUploadButtonClick = false;
      return;
  }
  const formData = new FormData();
  formData.append('propID', this.propID);
  const CreatedBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('createdBy', CreatedBy); 

  Array.from(this.selectedPropertyFloorFiles).forEach((file: File) => {
      formData.append('images', file, file.name);
  });

   this.apiurls.post<any>('uploadFloorImages', formData).subscribe(
      response => {
        this.PropertyFloorImageOnFileClicked=false;
        this.propertyfloorImagesUploadButtonClick=false;
        this.getPropertyFloorImagesForProperty(this.propID); 
        const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error => {
          console.error('Upload failed:', error);
      }
  );
}

uploadPropertyVideos(): void {
  this.propertyVideoUploadButtonClick = true;
  if (!this.propID || !this.selectedPropertyVideoFiles || this.selectedPropertyVideoFiles.length === 0) {
      console.error('Property ID is required and you must select a video.');
      this.propertyVideoUploadButtonClick = false;
      return;
  }

  const formData = new FormData();
  formData.append('propID', this.propID);
  
  const CreatedBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('createdBy', CreatedBy);

  const ModifiedBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('ModifiedBy', ModifiedBy);
  
  Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
      formData.append('videos', file, file.name);
  });

    this.http.post('https://localhost:7190/api/Users/uploadPropertyVideo', formData).subscribe(
        response => {
            this.PropertyVideoOnFileClicked = false;
            this.propertyVideoUploadButtonClick = false;
            this.getPropertyVideo(this.propID);  
            const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';  
          }
      },
      error => {
          console.error('Upload failed:', error);
      }
  );
}

uploadPropertyDocuments(): void {
  this.propertydocumenetUploadButtonClick = true;
  if (!this.propID || !this.selectedPropertyDocumentFiles || this.selectedPropertyDocumentFiles.length === 0) {
      console.error('Property ID is required and you must select a document.');
      this.propertydocumenetUploadButtonClick = false;
      return;
  }

  const formData = new FormData();
  formData.append('propID', this.propID);
  const CreatedBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('createdBy', CreatedBy); 
  Array.from(this.selectedPropertyDocumentFiles).forEach((file: File) => {
      formData.append('documents', file, file.name);
  });

   this.apiurls.post<any>('uploadPropertyDocument', formData).subscribe(
      response => {
        this.PropertyDocumentOnFileClicked=false;
        this.propertydocumenetUploadButtonClick=false;
        this.getPropertyDocument(this.propID); 
        const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';  
        }
      },
      error => {
          console.error('Upload failed:', error);
      }
  );
}

  getPropertyImagesForProperty(propID: string): void {
    this.apiurls.get<any>(`getimages/${propID}`).subscribe((response: any) => {
      this.uploadedImages1 = response.map((image: any) => {
        // const imageUrls = `https://localhost:7190${image.url}`; 
        const imageUrls = this.apiurls.getImageUrl(image.url);
        const customOrder = image.imageOrder ? parseInt(image.imageOrder, 10) : 0;
        return {
          ...image,
          propID: propID,
          imageUrls,     
          ImageOrder: image.imageOrder, 
          customOrder        
        };
        
      });

      this.originalUploadedImages1 = this.uploadedImages1.map(img => ({
        id: img.id,
        imageOrder: img.customOrder,
        defaultImage: img.DefaultImage
      }));
  
    }, error => {
      console.error('Error fetching images:', error);
    });
  }

  
  hasImageListChanged(): boolean {
    if (this.uploadedImages1.length !== this.originalUploadedImages1.length) {
      return true;
    }
  
    for (let i = 0; i < this.uploadedImages1.length; i++) {
      const current = this.uploadedImages1[i];
      const original = this.originalUploadedImages1.find(o => o.id === current.id);
  
      if (!original || 
          original.imageOrder !== current.customOrder || 
          original.defaultImage !== current.DefaultImage) {
        return true;
      }
    }
  
    return false;
  }
  
  getPropertyFloorImagesForProperty(propID: string): void {
   this.apiurls.get<any>(`get-Floorimages/${propID}`).subscribe(
      (response: any) => {
  
        if (!Array.isArray(response)) {
          return;
        }
  
        this.uploadedFloorImages1 = response.map((image: any) => {
          // const imageUrls = image.imageUrl ? `https://localhost:7190${image.imageUrl}` : '';  
          const imageUrls = this.apiurls.getImageUrl(image.imageUrl);
          const customOrder = image.imageOrder ? parseInt(image.imageOrder, 10) : 0;
  
          return {
            ...image,
            propID: propID,
            imageUrls,  
            ImageOrder: image.imageOrder,
            customOrder,
          };
        });
        this.originalUploadedFloorImages1 = this.uploadedFloorImages1.map(img => ({
          id: img.id,
          imageOrder: img.customOrder,
          defaultImage: img.DefaultImage
        }));
  
      },
      (error) => {
        console.error('Error fetching floor images:', error);
      }
    );
  }

  hasFloorImageListChanged(): boolean {
    if (this.uploadedFloorImages1.length !== this.originalUploadedFloorImages1.length) {
      return true;
    }
    for (let i = 0; i < this.uploadedFloorImages1.length; i++) {
      const current = this.uploadedFloorImages1[i];
      const original = this.originalUploadedFloorImages1.find(o => o.id === current.id);
  
      if (!original ||
          original.imageOrder !== current.customOrder ||
          original.defaultImage !== current.DefaultImage) {
        return true;
      }
    }
  
    return false;
  }
  

  getPropertyVideo(propID: string): void {
    this.apiurls.get<any>(`get-PropertyVideo/${propID}`).subscribe(
      (response: any) => {
  
        if (!Array.isArray(response)) {
          return;
        }
  
        this.uploadedVideos1 = response.map((video: any) => {
          // const videoUrl = video.videoUrl ? `https://localhost:7190${video.videoUrl}` : '';
          const videoUrl = this.apiurls.getImageUrl(video.videoUrl);
          return {
            ...video,
            propID: propID,
            videoUrl,  
          
          };
        });
  
      },
      (error) => {
        console.error('Error fetching video images:', error);
      }
    );
}

 getPropertyDocument(propID: string): void {
   this.apiurls.get<any>(`get-Documents/${propID}`).subscribe(
      (response: any) => {
          this.uploadedDocuments1 = response.map((document: any) => {
            // const documentUrl = document.documentUrl ?`https://localhost:7190${document.documentUrl}` : ''; 
            const documentUrl = this.apiurls.getImageUrl(document.documentUrl);
          const safeDocumentUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
          return {
            ...document,  
            propID: propID,
            documentUrl,   
            safeDocumentUrl,  
          };
        });
      },
      error => {
        console.error('Error fetching documents:', error);
      }
    );
  }



  deleteImage(image: any): void {
    const index = this.uploadedImages.indexOf(image);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1);
      if (this.selectedPropertyFiles) {
        const filesArray = Array.from(this.selectedPropertyFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));
        this.selectedPropertyFiles = dataTransfer.files;
        this.propertyInsStatus = "Image deleted successfully!";
        this.isUpdateModalOpen = true;
      }
    }
  }

  deleteFloorImage(image: any): void {
    const index = this.uploadedFloorImages.indexOf(image);

    if (index !== -1) {
      this.uploadedFloorImages.splice(index, 1);
      if (this.selectedPropertyFloorFiles) {
        const filesArray = Array.from(this.selectedPropertyFloorFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));
        this.selectedPropertyFloorFiles = dataTransfer.files;
        this.propertyInsStatus = "Image deleted successfully!";
        this.isUpdateModalOpen = true;
      }
    }
  }


  deleteVideoSelected(video: any): void {
    const index = this.uploadedVideos.indexOf(video);
    if (index !== -1) {
      this.uploadedVideos.splice(index, 1);
      if (this.selectedPropertyVideoFiles) {
        const filesArray = Array.from(this.selectedPropertyVideoFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));
        this.selectedPropertyVideoFiles = dataTransfer.files;
        this.propertyInsStatus = "Video deleted successfully!";
        this.isUpdateModalOpen = true;
      }
    }
  }

  deletePropertyDocumentSelected(document: any): void {
    const index = this.uploadedDocuments.indexOf(document);
    if (index !== -1) {
      this.uploadedDocuments.splice(index, 1);
      if (this.selectedPropertyDocumentFiles) {
        const filesArray = Array.from(this.selectedPropertyDocumentFiles);
        const updatedFilesArray = filesArray.filter((file: File, i: number) => i !== index);
        const dataTransfer = new DataTransfer();
        updatedFilesArray.forEach((file: File) => dataTransfer.items.add(file));
        this.selectedPropertyDocumentFiles = dataTransfer.files;
        this.propertyInsStatus = "document deleted successfully!";
        this.isUpdateModalOpen = true;
      }
    }
  }
  

  deleteImage1(propertyId: string, imageId: number): void {
    // this.http.delete(`https://localhost:7190/api/Users/delete-image/${propertyId}/${imageId}`, {
    //   headers: { 'Content-Type': 'application/json' },
    //   responseType: 'text' 
    // }).subscribe({
    //   next: (response: string) => {
    //     const index = this.uploadedImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
    //     if (index !== -1) {
    //       this.uploadedImages1.splice(index, 1); 
    //     }
    //     this.getPropertyImagesForProperty(this.propID);
    //   },

    const endpoint = `delete-image/${propertyId}/${imageId}`;
    this.apiurls.delete<string>(endpoint).subscribe({
      next: (response: string) => {
        const index = this.uploadedImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
        if (index !== -1) {
          this.uploadedImages1.splice(index, 1);
          this.propertyInsStatus = "Image deleted successfully!";
          this.isUpdateModalOpen = true;
        }
      
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
    
   
  }

  deleteFloorImage1(propertyId: string, imageId: number): void {
    // this.http.delete(`https://localhost:7190/api/Users/delete-Floorimage/${propertyId}/${imageId}`, {
    //   headers: { 'Content-Type': 'application/json' },
    //   responseType: 'text' 
    // }).subscribe({
    //   next: (response: string) => {
        
    //     const index = this.uploadedFloorImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
    //     if (index !== -1) {
    //       this.uploadedFloorImages1.splice(index, 1); 
    //     }
    
    //     this.getPropertyFloorImagesForProperty(this.propID);
    //   },
    const endpoint = `delete-Floorimage/${propertyId}/${imageId}`;
    this.apiurls.delete<string>(endpoint).subscribe({
      next: (response: string) => {
        const index = this.uploadedFloorImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
        if (index !== -1) {
          this.uploadedFloorImages1.splice(index, 1);
          this.propertyInsStatus = "Image deleted successfully!";
          this.isUpdateModalOpen = true;
        }
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
    
   
  }

  deleteVideo(propertyId: string, VideoId: number): void {
    // this.http.delete(`https://localhost:7190/api/Users/delete-PropertyVideo/${propertyId}/${VideoId}`, {
    //   headers: { 'Content-Type': 'application/json' },
    //   responseType: 'text' 
    // }).subscribe({
    //   next: (response: string) => {
    //     console.log('Video deleted from database:', response);  
        
    //     const index = this.uploadedVideos1.findIndex(video => video.id === VideoId && video.propID === propertyId);
    //     if (index !== -1) {
    //       this.uploadedVideos1.splice(index, 1); 
    //     }
    
    //     this.getPropertyVideo(this.propID);
    //   },
    const endpoint = `delete-PropertyVideo/${propertyId}/${VideoId}`;
    this.apiurls.delete<string>(endpoint).subscribe({
      next: (response: string) => {
        console.log('Video deleted from database:', response);
        const index = this.uploadedVideos1.findIndex(video => video.id === VideoId && video.propID === propertyId);
        if (index !== -1) {
          this.uploadedVideos1.splice(index, 1);
          this.propertyInsStatus = "Video deleted successfully!";
          this.isUpdateModalOpen = true;
        }
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

  deleteDocument(propertyId:string, DocumentID: number): void {
    // this.http.delete(`https://localhost:7190/api/Users/delete-PropertyDocument/${propertyId}/${DocumentID}`, {
    //   headers: { 'Content-Type': 'application/json' },
    //   responseType: 'text'
    // }).subscribe({
    //   next: (response: string) => {
    //     console.log('Document deleted from database:', response);
        
     
    //     const index = this.uploadedDocuments1.findIndex(document => document.id === DocumentID && document.propID === propertyId);
    //     if (index !== -1) {
    //       this.uploadedDocuments1.splice(index, 1);
    //     }
    //     this.getPropertyDocument(this.propID);
    //   },
    const endpoint = `delete-PropertyDocument/${propertyId}/${DocumentID}`;
    this.apiurls.delete<string>(endpoint).subscribe({
      next: (response: string) => {
        console.log('Document deleted from database:', response);
        const index = this.uploadedDocuments1.findIndex(document => document.id === DocumentID && document.propID === propertyId);
        if (index !== -1) {
          this.uploadedDocuments1.splice(index, 1);
          this.propertyInsStatus = "Documenet deleted successfully!";
          this.isUpdateModalOpen = true;
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
    this.selectedImage = imagePath;  
    this.isModalOpen = true;  
  }

  openVideoModal(videoPath:string):void{
    this.seletedVideo=videoPath;
    this.isVideoModalOpen=true;
  }

  openModaldocumnet(DocumentPath:string): void{
    this.selecteddocumnet=DocumentPath;
    this.isDocumnetModalOpen=true;
  }
 

  closeModaldocumnet(): void {
    this.isDocumnetModalOpen = false;  
    this.selecteddocumnet = ''; 
  }
  closeModal(): void {
    this.isModalOpen = false; 
    this.selectedImage = ''; 
  }

  closeVideoModal(): void {
    this.isVideoModalOpen = false; 
    this.seletedVideo = '';
  }

  onFileSelect(event: any): void {
    this.PropertyOnfileClicked = true;
  
    if (event?.target?.files) {
      this.selectedPropertyFiles = event.target.files;
  
      if (this.selectedPropertyFiles && this.selectedPropertyFiles.length > 0) {
        this.uploadedImages = [];
  
        const fileArray = Array.from(this.selectedPropertyFiles);
  
        Promise.all(
          fileArray.map((file: File, index: number) => {
            return new Promise<{ path: string; customOrder: number }>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({ path: reader.result as string, customOrder: index + 1 });
              };
              reader.readAsDataURL(file);
            });
          })
        ).then((images) => {
          this.uploadedImages = images;
        });
  
        if (this.editclicked) {
          this.isUpdateButtonEnabled = true;
        }
        else{
          this.isUpdateButtonEnabled = false;
        }
        this.propertyImagesUploadButtonClick = false;
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }
  
  onFloorFileSelect(event: any): void {
    this.PropertyFloorImageOnFileClicked = true;
  
    if (event?.target?.files) {
      this.selectedPropertyFloorFiles = event.target.files;
  
      if (this.selectedPropertyFloorFiles && this.selectedPropertyFloorFiles.length > 0) {
        this.uploadedFloorImages = []; 
  
        const fileArray = Array.from(this.selectedPropertyFloorFiles);
  
        Promise.all(
          fileArray.map((file: File, index: number) => {
            return new Promise<{ path: string; customOrder: number }>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({ path: reader.result as string, customOrder: index + 1 });
              };
              reader.readAsDataURL(file);
            });
          })
        ).then((images) => {
          this.uploadedFloorImages = images;
        });
  
        if (this.editclicked) {
          this.isUpdateButtonEnabled = true;
        } else {
          this.isUpdateButtonEnabled = false;
        }
        this.propertyfloorImagesUploadButtonClick = false;
      } else {
        console.error('No files selected');
      }
    } else {
      console.error('No files in the input');
    }
  }
  

  // onVideoFileSelect(event: any): void {
  //   this.PropertyVideoOnFileClicked = true;
  
  //   if (event?.target?.files) {
  //     this.selectedPropertyVideoFiles = event.target.files;
  
  //     if (this.selectedPropertyVideoFiles && this.selectedPropertyVideoFiles.length > 0) {
  //       this.uploadedVideos = []; 
  
  //       Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
  //         const fileSizeKB = file.size / 1024; 
  
  //         if (fileSizeKB < 2048) { 
  //           const reader = new FileReader();
  //           reader.onload = () => {
  //             this.uploadedVideos.push({ path: reader.result as string });
  //           };
  //           reader.readAsDataURL(file); 
  //         } else {
  //           this.PropertyVideoOnFileClicked = false;
  //           alert(`File ${file.name} is too large and will not be uploaded. Maximum size allowed is 2MB.`);
  //         }
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
        this.uploadedVideos = []; 
        let hasValidFile = false;
  
        Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
          const fileSizeKB = file.size / 1024; 
  
          if (fileSizeKB < 2048) { 
            const reader = new FileReader();
            reader.onload = () => {
              this.uploadedVideos.push({ path: reader.result as string });
              hasValidFile = true;
              this.isUpdateButtonEnabled = true;
            };
            reader.readAsDataURL(file); 
          } else {
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
  
  

  onDocumentFileSelect(event: any): void {
    this.PropertyDocumentOnFileClicked = true;
  
    if (event?.target?.files) {
      this.selectedPropertyDocumentFiles = event.target.files;
  
      if (this.selectedPropertyDocumentFiles && this.selectedPropertyDocumentFiles.length > 0) {
        this.uploadedDocuments = []; 
        let hasValidFile = false;
  
        Array.from(this.selectedPropertyDocumentFiles).forEach((file: File) => {
          const fileSizeKB = file.size / 1024; 
  
          if (fileSizeKB < 2048) { 
            const reader = new FileReader();
            reader.onload = () => {
              const unsafeUrl = reader.result as string; 
              const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
              this.uploadedDocuments.push({ path: unsafeUrl, DocumentPath: safeUrl });
              hasValidFile = true;
              this.isUpdateButtonEnabled = true; 
            };
            reader.readAsDataURL(file);  
          } else {
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
  
  // onDocumentFileSelect(event: any): void {
  //   this.PropertyDocumentOnFileClicked = true;
  
  //   if (event?.target?.files) {
  //     this.selectedPropertyDocumentFiles = event.target.files;
  
  //     if (this.selectedPropertyDocumentFiles && this.selectedPropertyDocumentFiles.length > 0) {
  //       this.uploadedDocuments = []; 
  //       Array.from(this.selectedPropertyDocumentFiles).forEach((file: File) => {
  //         const fileSizeKB = file.size / 1024; 
  
  //         if (fileSizeKB < 2048) { 
  //           const reader = new FileReader();
  //           reader.onload = () => {
  //             const unsafeUrl = reader.result as string; 
  //             const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
  //             this.uploadedDocuments.push({ path: unsafeUrl, DocumentPath: safeUrl });
  //           };
  //           reader.readAsDataURL(file);  
  //         } else {
  //           this.PropertyDocumentOnFileClicked = false;
  //           this.propertyInsStatus = `Document file ${file.name} is too large and will not be uploaded. Maximum size allowed is 2MB.`;
  //           this.isUpdateModalOpen = true;
            
  //         }
  //       });
  //     } else {
  //       console.error('No files selected');
  //     }
  //   } else {
  //     console.error('No files in the input');
  //   }
  // }
  
 

  SubmitPropertyClick(){
  }

  
  editproperty(propertyID: string): void {
    this.editclicked = true;
    this.propID = propertyID;  
    this.getTotalPropertyDet(propertyID);
    this.fetchAminities();
    this.loadCountries();
    this.getPropertTypes();
    
    if (this.isUpdateButtonEnabled === true) {
      this.isUpdateButtonEnabled = false;
    } else {
      this.isUpdateButtonEnabled = false;  
    }
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
    // this.http.put(`https://localhost:7190/api/Users/updatePropertyIsActiveStatus/${PropId}?Status=${Status}`, {}).subscribe({
    //   next: (response: any) => {
    //     if (response.statusCode == "200") {
    //       this.propertyInsStatus = "Property IsActive Status updated successfully!";
    //       this.isUpdateModalOpen = true;

    //       this.fetchProperties();
    //     }
    //   },
    const endpoint = `updatePropertyIsActiveStatus/${PropId}?Status=${status}`;
    this.apiurls.put(endpoint, {}).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.propertyInsStatus = "Property IsActive Status updated successfully!";
          this.isUpdateModalOpen = true;
          this.fetchProperties();
          this.cdRef.detectChanges();
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
    this.apiurls.get<any>(`GetOnlyPropertyDetailsById/${propID}`).subscribe((response: any) => {
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
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;  
      };
  
      const formattedPossessionDate = convertToDDMMYYYY(response.possessionDate);
      const formattedListDate = convertToDDMMYYYY(response.listDate);

      const formattedPossessionDateForInput = convertToYYYYMMDD(response.possessionDate); 
      const formattedListDateForInput = convertToYYYYMMDD(response.listDate); 

      const selectedAmenitiesString = response.aminities || '';
      this.selectedAmenities = selectedAmenitiesString.split(',')
  .map((amenity: string): Amenity => {
    const [id, name,icon] = amenity.trim().split(' - ');  
    return { id, name,icon };  
  })
  .filter((amenity: Amenity) => amenity.id && amenity.name&& amenity.icon);
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
        AvailabilityOptions: response.availabilityOptions,
      });

      this.selectedCountry = response.country;
      this.selectedState = response.state;
      this.selectedCity = response.city;

      this.SelectedCountryName=response.countryName,
      this.SelectedStateName=response.stateName,
      this.SelectedCityName=response.cityName,
      this.SelectedPropertyTypeName=response.propertyTypeName,
      this.loadStates();  
      this.loadCities();  

      
      if(response.activeStatus=="1"){
        this.propertyActiveStatus=true;
      }
      else{
        this.propertyActiveStatus=false;
      }

      if(response.propertySaleStatus=="1"){
        this.SoldOutProperty=false;
      }
      else{
        this.SoldOutProperty=true;
      }

      
    }, error => {
      console.error('Error fetching property details:', error);
    });
  }

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);  
      reader.onerror = reject;  
      reader.readAsDataURL(blob);  
    });
  }


  submitpropertyDet(){

    if (this.propertyform.invalid) {
      return;
    }
    else{
      const selectedAmenitiesString = this.selectedAmenities
  .map(amenity => `${amenity.id} - ${amenity.name} - ${amenity.icon}`)
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
      aminities: selectedAmenitiesString,

      websiteurl:new String(this.propertyform.get('WebsiteUrl')?.value).toString() || null,
      Pinteresturl:new String(this.propertyform.get('Pinteresturl')?.value).toString() || null,
      Facebookurl:new String(this.propertyform.get('Facebookurl')?.value).toString() || null,
      Twitterurl:new String(this.propertyform.get('Twitterurl')?.value).toString() || null,
      GoogleLocationurl:new String(this.propertyform.get('GoogleLocationurl')?.value).toString() || null,
      availabilityOptions:new String(this.propertyform.get('AvailabilityOptions')?.value).toString(),
      userID:new String(localStorage.getItem('email')).toString(),
      CreatedBy: new String(localStorage.getItem('email')).toString(),
      ActiveStatus:"0",
      CountryName: this.SelectedCountryName?.toString() || "",
      StateName: this.SelectedStateName?.toString() || "",
      CityName: this.SelectedCityName?.toString() || "",
      PropActiveStatus: "1",
      PropertyTypeName: this.SelectedPropertyTypeName?.toString() || "",
      propertySaleStatus:"0",
      // CreatedBy:localStorage.getItem('email') as string
    };

    // this.http.post("https://localhost:7190/api/Users/inspropertysample", data, {
    //   headers: { 'Content-Type': 'application/json' }
    // }).subscribe({
    //   next: (response: any) => {
    //     if(response.statusCode=="200"){
    //       this.uploadPropertyImages();
    //       this.uploadPropertyFloorImages();
    //       this.uploadPropertyVideos();
    //       this.uploadPropertyDocuments();

    this.apiurls.post("inspropertysample", data).subscribe({
      next: (response: any) => {
        if(response.statusCode=="200"){
          this.propertyInsStatus = "Property submitted successfully!";
          this.isUpdateModalOpen = true;
          this.propertyImagesClicked=false;
          this.propertyFloorImagesClicked=false;
          this.propertyVideosClicked=false;
          this.propertyDocumentsClicked=false;
          this.editclicked = false;
          this.addnewPropertyclicked = false;
          this.cdRef.detectChanges();
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Inserting Property.";
        this.isUpdateModalOpen = true;
        console.error("Error details:", error);
      }
    });
  }

  isOrderSubmitEnabled: boolean = false;




  updatePropertyDet() {
    const selectedAmenitiesString = this.selectedAmenities
  .map(amenity => `${amenity.id} - ${amenity.name} - ${amenity.icon}`)
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
      ModifiedBy: new String(localStorage.getItem('email')).toString(),
      ActiveStatus:'',
      // CountryName:(this.SelectedCountryName).toString(),
      // StateName:(this.SelectedStateName).toString(),
      // CityName:(this.SelectedCityName).toString(),
      // PropActiveStatus:"",
      // PropertyTypeName:(this.SelectedPropertyTypeName).toString()     
      CountryName: (this.SelectedCountryName?.toString() || ""),
      StateName: (this.SelectedStateName?.toString() || ""),
      CityName: (this.SelectedCityName?.toString() || ""),
      PropActiveStatus: "",
      PropertyTypeName: (this.SelectedPropertyTypeName?.toString() || ""),
      // ModifiedBy:(this.UserIDDb).toString(),
    };
    console.log(this.SelectedCountryName)
    console.log(this.SelectedStateName)
    console.log(this.SelectedCityName)
    console.log(this.SelectedPropertyTypeName)
    
  
    if (!this.propID || this.propID.trim() === '') {
      console.error("Invalid propID");
      return;
    }
  
    // this.http.put(`https://localhost:7190/api/Users/updatePropertyDet/${this.propID}`, data, {
    //   headers: { 'Content-Type': 'application/json' }
    // }).subscribe({
    //   next: (response: any) => {
    //     if (response.statusCode == "200") {
    //       this.uploadPropertyImages();
    //       this.uploadPropertyFloorImages();
    //       this.uploadPropertyVideos();
    //       this.uploadPropertyDocuments();

    this.apiurls.put(`updatePropertyDet/${this.propID}`, data).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.propertyInsStatus = "Property updated successfully!";
          this.isUpdateModalOpen = true;
          this.editclicked = false;
          this.addnewPropertyclicked = false;
          this.isOrderSubmitEnabled = true;
           this.cdRef.detectChanges();
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Updating Property.";
        this.isUpdateModalOpen = true;
        console.error("Error details:", error);
      }
    });
  }
 
  
  checkForChanges() {
    this.isUpdateButtonEnabled = this.propertyform.dirty;
  }
  

  addNewProperty(){
    this.addnewPropertyclicked=true;
 
    this.editclicked=false;
    this.propertyform.reset();
    this.selectedCountryId="";
    this.selectedPropertyAreaId="";
    this.selectedPropertyFacingId="";
    this.selectedPropertystatusId="";
    this.selectedPropertyForId="";
    this.selectedPropertyTypeId="";
    this.selectedCityId="";
    this.selectedStateId="";
    this.generatePropertyID();
    this.loadCountries();
    this.loadStates();
    this.loadCities();
    this.fetchAminities();
    this.getPropertTypes();
    this.clearSelections(); 
    this.uploadedImages1=[];
    this.uploadedFloorImages1=[];
    this.uploadedDocuments1=[];
    this.uploadedVideos1=[]; 
}


  clearSelections(): void {
    this.selectedAmenities = [];
    this.uploadedImages1=[];
    this.uploadedFloorImages1=[];
    this.uploadedDocuments1=[];
    this.uploadedVideos1=[];
  }
  
  getownProperties(){
    this.apiurls.get<any>(`GetAllPropertyDetailsWithUserID?userID=${this.userID}`)
    .subscribe((response: any) => {
      this.properties = response.map((property: any) => ({
        propID: property.propID,
        propname: property.propname,
        developedby: property.developedby
      }));

    }, error => {
      console.error('Error fetching properties:', error);
    });
    
  }
  getUserProperties(){
    this.apiurls.get<any>(`GetAllUsersPropertyDetails?userID=${this.userID}`) 
    .subscribe((response: any) => {
      this.properties = response.map((property: any) => ({
        propID: property.propID,
        propname: property.propname,
        developedby: property.developedby
      }));

    }, error => {
      console.error('Error fetching properties:', error);
    });
    
  }

  
  get filteredProperties() {
    return this.properties.filter(property => 
      property.propID.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.propname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.developedby.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    console.log(this.searchQuery.toLowerCase());
  }

  get totalPages(): number {
    const filteredProperties = this.filteredProperties;
    return Math.ceil(filteredProperties.length / this.pageSize);
  }

  getPaginatedProperties() {
    const filteredProperties = this.filteredProperties;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return filteredProperties.slice(start, end);
  }


  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
    }
  }


  previousPage(): void {
    if (this.currentPage > 1) {
        this.currentPage--;
    }
}

getVisiblePages(): number[] {
  let startPage = Math.max(1, this.currentPage - Math.floor(this.visiblePageCount / 2));
  let endPage = Math.min(this.totalPages, startPage + this.visiblePageCount - 1);

  if (endPage - startPage < this.visiblePageCount - 1) {
      startPage = Math.max(1, endPage - this.visiblePageCount + 1);
  }

  let pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
  }
  return pages;
}


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
      this.propertyform.reset();
      this.fetchProperties();
      if(this.isUpdateButtonEnabled=true){
        this.isUpdateButtonEnabled=false;
      }
      else{
        this.isUpdateButtonEnabled=false;
      }
    }
    this.searchQuery = '';
  }


  declineProperty(){
    const PropId=this.propertyform.get('id')?.value
    this.updatePropertyStatus(PropId,'2');
  }

  ApproveProperty(){
    const PropId=this.propertyform.get('id')?.value
    this.updatePropertyStatus(PropId,'1');
  }

  SoldOutPropertyClick(){
    const PropId=this.propertyform.get('id')?.value
    this.updatePropertySoldOutStatus(PropId,'1');
  }


  UnSoldPropertyClick(){
    const PropId=this.propertyform.get('id')?.value
    this.updatePropertySoldOutStatus(PropId,'0');
  }


    selectAll(): void {
      this.selectedAmenities = this.amenities.map(amenity => ({
        id: amenity.aminitieID,
        name: amenity.name,
        icon: amenity.icon
      }));
      console.log("aminities list",this.amenities);
      console.log(this.selectedAmenities);
    }
  
    deselectAll(): void {
      this.selectedAmenities = [];
      console.log('All amenities deselected');
    }

  updatePropertyStatus(PropId: string, Status: string): void {
    // this.http.put(`https://localhost:7190/api/Users/updatePropertyStatus/${PropId}?Status=${Status}`, {}).subscribe({
    //   next: (response: any) => {
    //     if (response.statusCode == "200") {
    //       this.propertyInsStatus = "Property Status updated successfully!";

    this.apiurls.put(`updatePropertyStatus/${PropId}?Status=${Status}`, {}).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.propertyInsStatus = "Property Status updated successfully!";
          this.isUpdateModalOpen = true;
          this.editclicked = false;    
          this.addnewPropertyclicked = false;
          this.fetchProperties();
          this.cdRef.detectChanges();
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Updating Property.";
        this.isUpdateModalOpen = true;
        console.error("Error details:", error);
      }
    });
  }



  updatePropertySoldOutStatus(PropId: string, SoldOutStatus: string): void {
    // this.http.put(`https://localhost:7190/api/Users/updatePropertySoldOutStatus/${PropId}?SoldOutStatus=${SoldOutStatus}`, {}).subscribe({
    //   next: (response: any) => {
    //     if (response.statusCode == "200") {
    //       // this.propertyInsStatus = "Property sold out status updated successfully!";
    //       if (SoldOutStatus === "1") {
    //         this.propertyInsStatus = "Property marked as Sold Out successfully!";
    //       } else {
    //         this.propertyInsStatus = "Property marked as Unsold successfully!";
    //       }
    //       this.isUpdateModalOpen = true;

    this.apiurls.put(`updatePropertySoldOutStatus/${PropId}?SoldOutStatus=${SoldOutStatus}`, {}).subscribe({
      next: (response: any) => {
        if (response.statusCode == "200") {
          this.propertyInsStatus = SoldOutStatus === "1"
            ? "Property marked as Sold Out successfully!"
            : "Property marked as Unsold successfully!";
            
          this.isUpdateModalOpen = true;

          this.editclicked = false;
          this.addnewPropertyclicked = false;
          this.fetchProperties();
          this.cdRef.detectChanges();
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
        
        this.apiurls.get<any>(`GetPropertiesByStatus?status=${status}`)
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
              else{
                
              }
              let PropertySaleStatus: string = '';
              if (property.propertySaleStatus === "1") {
                PropertySaleStatus = "Sold Out";
              } else if (property.propertySaleStatus === "0") {
                PropertySaleStatus = "Unsold";
              }
      
              return {
                propID: property.propID,          
                propname: property.propname,
                developedby: property.developedby,
                status: PropertyStatus,
                SaleStatus:PropertySaleStatus
                          
              };
            });
      
          }, error => {
            console.error('Error fetching properties:', error);
          });
      }
  
     fetchFilteredProperties(whose: string, status: string, IsActivestatus: string, SoldOutstatus: string, search: string): void {
        let params = new HttpParams()
            .set('whose', whose)
            .set('UserID', this.userID || '') 
            .set('status', status || '')
            .set('IsActivestatus', IsActivestatus || '')
            .set('SoldOutstatus', SoldOutstatus || '')
            .set('search', search || '');

        // const url = `https://localhost:7190/api/Users/GetFilteredProperties?${params.toString()}`;

        // this.http.get(url).subscribe(
        //     (response: any) => {
        //         console.log('API Response:', response); 
        //         if (response.statusCode === 200) {
        //             this.properties = response.data.map((property: any) => ({
        //                 propID: property.propID,
        //                 propname: property.propname,
        //                 developedby: property.developedby,

        const endpoint = `GetFilteredProperties?${params.toString()}`;
        this.apiurls.get(endpoint).subscribe(
          (response: any) => {
              console.log('API Response:', response); 
              if (response.statusCode === 200) {
                  this.properties = response.data.map((property: any) => ({
                      propID: property.propID,
                      propname: property.propname,
                      developedby: property.developedby,
                        status: this.getPropertyStatus(property.activeStatus),
                        IsActiveStatus: this.getPropertyIsActiveStatus(property.propActiveStatus),
                        IsActiveStatusBoolean: property.propActiveStatus,
                        SaleStatus: property.propertySaleStatus === "1" ? "Sold Out" : "Unsold"
                      }));
                    this.filteredPropertiesNotNull = false;
                    this.currentPage = 1;
                } else if (response.statusCode === 404) {
                    this.filteredPropertiesNotNull = true;
                } else {
                    this.properties = [];
                }
            },
            error => {
                console.error('Error fetching properties:', error);
                this.filteredPropertiesNotNull = true;
                this.properties = [];
            }
        );
     }


    filteredPropertiesCount: number = 0;
    currentStatusLabel: string = '';



  onWhosePropertySelectionChange(event: any): void {
    this.selectedWhoseProperties = event.target.value;
    this.applyFilters();
    this.currentPage = 1;
  }

  onWhosePropertyStatusSelectionChange(event: any): void {
    let selectedStatus = event.target.value;
    console.log("Selected Status:", selectedStatus);
    console.log("Selected Whose Properties:", this.selectedWhoseProperties);

    if (selectedStatus == "0") {        
        if (this.selectedWhoseProperties && this.selectedWhoseProperties !== "0") {
            this.applyFilters();
            this.currentPage = 1;
        } else {
            this.fetchProperties();
        }
    } else if (selectedStatus == "1") {
        this.selectedPropertyStatus1 = "1"; 
         this.selectedIsActiveStatus1 = ''; 
         this.propertySoldOutStatus1='';
        this.applyFilters();
        this.currentPage = 1;
    } else if (selectedStatus == "2") {
        this.selectedPropertyStatus1 = "2"; 
        this.selectedIsActiveStatus1 = ''; 
        this.propertySoldOutStatus1='';
        this.applyFilters();
        this.currentPage = 1;
    } else if (selectedStatus == "3") {
        this.selectedPropertyStatus1 = ""; 
        this.selectedIsActiveStatus1 = '1'; 
        this.propertySoldOutStatus1=''; 
        this.applyFilters();
        this.currentPage = 1;
    } else if (selectedStatus == "4") {
      this.selectedPropertyStatus1 = ""; 
          this.selectedIsActiveStatus1 = '0'; 
        this.propertySoldOutStatus1='';
        this.applyFilters();
        this.currentPage = 1;
    } else if (selectedStatus == "5") {
      this.selectedPropertyStatus1 = ""; 
        this.selectedIsActiveStatus1 = ''; 
         this.propertySoldOutStatus1='1';
        this.applyFilters();
        this.currentPage = 1;
    }
    
  }
  
  applyFilters(): void {
    this.fetchFilteredProperties(this.selectedWhoseProperties, this.selectedPropertyStatus1, this.selectedIsActiveStatus1,this.propertySoldOutStatus1, this.searchQuery);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

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
      case '0': return 'InActive';
      default: return 'Unknown';
    }
  }

  UpdatecloseModal() {
    this.isUpdateModalOpen = false;
  }

  handleOk() {
    this.UpdatecloseModal();
    if(!this.propertyImagesClicked && !this.propertyFloorImagesClicked && !this.propertyVideosClicked && !this.propertyDocumentsClicked){
      this.editclicked = false;
      this.addnewPropertyclicked = false;
      this.propertyform.reset();
      this.fetchProperties();
      if(this.isUpdateButtonEnabled=true){
        this.isUpdateButtonEnabled=false;
      }
      else{
        this.isUpdateButtonEnabled=false;
      }
    }
    
  }

 
editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      // ['image'],
      // ['clean'],
      
      //  'code-block'
    ],
  };
  
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
  

  makeImageDefault(propID: string, imageID: number) {
    const selectedImage = this.uploadedImages1.find(img => img.id === imageID);
  
    if (selectedImage) {
      selectedImage.DefaultImage = "1"; 
  
      this.uploadedImages1.forEach(img => {
        if (img.id !== imageID) {
          img.DefaultImage = "0"; 
        }
      });
  
      this.uploadedImages1 = [
        selectedImage, 
        ...this.uploadedImages1.filter(img => img.id !== imageID)
      ];
  
      this.updateDefaultImageInDatabase(propID, imageID);
    }
  }
  
  // updateDefaultImageInDatabase(propID: string, imageID: number) {
  //   this.http.put(`https://localhost:7190/api/Users/update-default-image/${propID}/${imageID}`, {})
  //     .subscribe(response => {
  //       console.log('Default image updated successfully');
  //     }, error => {
  //       console.error('Error updating default image:', error);
  //     });
  // }

  updateDefaultImageInDatabase(propID: string, imageID: number): void {
    const endpoint = `update-default-image/${propID}/${imageID}`;
    this.apiurls.put(endpoint, {}).subscribe(
        response => {
            console.log('Default image updated successfully');
        },
        error => {
            console.error('Error updating default image:', error);
        }
    );
   }

   onOrderChange(): void {
    const validationError = this.validateOrders();
  
    if (!validationError) {
      this.isUpdateButtonEnabled = true;
    } else {
      this.isUpdateButtonEnabled = false;
    }
  }
  
  submitCustomOrder() {
    const validationError = this.validateOrders();
    if (validationError) {
      // alert(validationError); 
      // return; 
      this.propertyInsStatus = validationError;
      this.isUpdateModalOpen = true;
      return; 
    }
    const updatedImages = this.uploadedImages1.map(image => ({
      id: image.id,
      imageOrder: image.customOrder.toString(),  
      defaultImage: image.DefaultImage === "1" ? "1" : "0" 
    }));  
    // this.propertyInsStatus = "order submitted successfully!";
    // this.isUpdateModalOpen = true;
    this.updateImageOrderInDatabase(updatedImages);
    this.isUpdateButtonEnabled = true;

  }
  
  
  validateOrders(): string | null {
    const seenOrders = new Set<number>();
    const orderNumbers = this.uploadedImages1.map(image => image.customOrder).sort((a, b) => a - b);
    for (let i = 0; i < orderNumbers.length; i++) {
      if (seenOrders.has(orderNumbers[i])) {

        // return 'There are duplicate order numbers. Please ensure all order numbers are unique in Images.';
        this.propertyInsStatus = 'There are duplicate order numbers. Please ensure all order numbers are unique in Images.';
        this.isUpdateModalOpen = true; 
        return this.propertyInsStatus;
      }
  
      if (i > 0 && orderNumbers[i] !== orderNumbers[i - 1] + 1) {
        // return 'Order numbers must be in sequence (no gaps). Please correct the sequence in Images.';
        this.propertyInsStatus = 'Order numbers must be in sequence (no gaps). Please correct the sequence in Images.';
        this.isUpdateModalOpen = true; 
        return this.propertyInsStatus;
      }
  
      seenOrders.add(orderNumbers[i]);

    }
    this.isUpdateButtonEnabled = true;
    return null;  
  }
  
  
  validateOrdersfloor(): string | null {
    const seenOrders = new Set<number>();
    const orderNumbers = this.uploadedFloorImages1.map(image => image.customOrder).sort((a, b) => a - b);
    let hasDuplicate = false;  
  
    for (let i = 0; i < orderNumbers.length; i++) {
      if (seenOrders.has(orderNumbers[i])) {
        hasDuplicate = true;  
      }
  
      if (i > 0 && orderNumbers[i] !== orderNumbers[i - 1] + 1) {
        // return 'Order numbers must be in sequence (no gaps). Please correct the sequence in floorimage.';
        this.propertyInsStatus = 'Order numbers must be in sequence (no gaps). Please correct the sequence in floorimage.';
        this.isUpdateModalOpen = true; 
        return this.propertyInsStatus;
      }
  
      seenOrders.add(orderNumbers[i]);

    }
  
    if (hasDuplicate) {
      // return 'There are duplicate order numbers. Please ensure all order numbers are unique in floorimage.';
      this.propertyInsStatus = 'There are duplicate order numbers. Please ensure all order numbers are unique in floorimage.';
      this.isUpdateModalOpen = true; 
      return this.propertyInsStatus;
    }
    this.isUpdateButtonEnabled = true;
    return null;  
  }

  
  OnlyAlphabetsAndSpacesAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode >= 48 && charCode <= 57) ||  
      (charCode >= 65 && charCode <= 90) || 
      (charCode >= 97 && charCode <= 122) || 
      charCode === 32 ||  
      charCode === 44 ||  
      charCode === 46     
    ) {
      return true;
    }
  
    return false;
  }
  


  // OnlyAlphabetsAndSpacesAllowed(event: { which: any; keyCode: any; }): boolean {
  //   const charCode = event.which ? event.which : event.keyCode;
  
  //   if (charCode !== 32 && (charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122)) {
  //     return false; 
  //   }
    
  //   return true; 
  // }

  
  // OnlyNumbersAllowed(event: { which: any; keyCode: any; target: HTMLInputElement; }): boolean {
  //   const charCode = event.which ? event.which : event.keyCode;
  //   const inputElement = event.target as HTMLInputElement;
    
  //   if (charCode > 31 && (charCode < 48 || charCode > 57)) {
  //     return false;
  //   }
    
  //   if (inputElement.value.length >= 10) {
  //     return false; 
  //   }
  //   return true;
  // }

  OnlyNumbersAllowed(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    if ((charCode >= 48 && charCode <= 57) || charCode === 44 || charCode === 8) {
      let numbersOnly = value.replace(/,/g, ''); 
      let lastChar = value.charAt(value.length - 1);
      if (numbersOnly.length >= 10 && charCode !== 8) {
        return false;
      }
      if (charCode === 44 && (lastChar === ',' || value === '')) {
        return false;
      }
  
      return true;
    }
  
    return false;
  }
  

  // OnlyNumbersAllowed(event: { which: any; keyCode: any; target: HTMLInputElement; }): boolean {
  //   const charCode = event.which ? event.which : event.keyCode;
  //   const inputElement = event.target as HTMLInputElement;
  //   const value = inputElement.value;
  
  //   if (
  //     (charCode >= 48 && charCode <= 57) ||   
  //     charCode === 44 ||                     
  //     charCode === 46                       
  //   ) {
  //     if (value.length >= 10) {
  //       return false;
  //     }
  //     if (charCode === 44 || charCode === 46) {
  //       if (value.includes(',') || value.includes('.')) {
  //         return false;
  //       }
  //     }
  
  //     return true;
  //   }
  //   return false;
  // }
  

  OnlypostelNumbersAllowed(event: KeyboardEvent): void {
    const inputChar = event.key;
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.value.length >= 6 && inputChar !== 'Backspace') {
      event.preventDefault(); 
      return;
    }

    if (!/[0-9]/.test(inputChar) && inputChar !== 'Backspace') {
      event.preventDefault(); 
    }
  }
  

//   OnlyNumbersAllowedforrange(event: KeyboardEvent): void {
//     const inputChar = event.key;
//     const currentValue = (event.target as HTMLInputElement).value;
//     if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(inputChar)) {
//         return;
//     }
//     if (inputChar >= '0' && inputChar <= '9') {
//         const parts = currentValue.split('-');

//         if (parts.length === 1) {
//             if (parts[0].length >= 6) {
//                 event.preventDefault();
//             }
//         }
//         if (parts.length === 2) {
//             if (parts[1].length >= 7) {
//                 event.preventDefault();
//             }
//         }
//         return;
//     }
//     if (inputChar === '-') {
//         const parts = currentValue.split('-');
//         if (!currentValue.includes('-') && parts.length === 1 && parts[0].length === 6) {
//             return;
//         }
//     }
//     event.preventDefault();
//     console.log('Form valid:', this.propertyform.valid);
//     console.log('TotalArea valid:', this.propertyform.get('TotalArea')?.valid);
//     console.log('TotalArea errors:', this.propertyform.get('TotalArea')?.errors);
//  }


  OnlyNumbersAllowedforrange(event: KeyboardEvent): void {
    const inputChar = event.key;
    const currentValue = (event.target as HTMLInputElement).value;
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(inputChar)) {
        return;
    }
    if (inputChar >= '0' && inputChar <= '9') {
        const parts = currentValue.split('-');

        if (parts.length === 1) {
            if (parts[0].length >= 6) {
                event.preventDefault();
            }
        }
        if (parts.length === 2) {
            if (parts[1].length >= 7) {
                event.preventDefault();
            }
        }
        return;
    }
    if (inputChar === '-') {
        const parts = currentValue.split('-');
        if (!currentValue.includes('-') && parts.length === 1 && parts[0].length === 6) {
            return;
        }
    }
    event.preventDefault();
 }


 OnlyNumbersAllowedforrangeforprice(event: KeyboardEvent): void {
  const inputChar = event.key;
  const currentValue = (event.target as HTMLInputElement).value;
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(inputChar)) {
      return;
  }
  if (inputChar >= '0' && inputChar <= '9') {
      const parts = currentValue.split('-');
      if (parts.length === 1) {
          if (parts[0].length >= 7) {
              event.preventDefault();
          }
      }
      if (parts.length === 2) {
          if (parts[1].length >= 8) {
              event.preventDefault();
          }
      }
      return;
  }

  // Handle hyphen entry
  if (inputChar === '-') {
      const parts = currentValue.split('-');

      // Allow the hyphen only if it's not already present and exactly 7 digits exist before it
      if (!currentValue.includes('-') && parts.length === 1 && parts[0].length === 7) {
          return;
      }
  }

  // Prevent any other character input
  event.preventDefault();
}
  
  
  
  
  // OnlyNumbersAllowedforrange(event: KeyboardEvent): void {
  //   const inputChar = event.key;
  //   if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(inputChar)) {
  //     return;
  //   }
  //   if (inputChar >= '0' && inputChar <= '9') {
  //     return;
  //   }
  //   const currentValue = (event.target as HTMLInputElement).value;
  //   if (inputChar === '-' && !currentValue.includes('-') && currentValue.length > 0) {
  //     return;
  //   }
  //   event.preventDefault();
  // }

  
  OnlyValidEmailChars(event: KeyboardEvent): boolean {
    const charCode = event.key;
    const allowedCharsRegex = /^[a-zA-Z0-9@._+-]$/;
    if (!allowedCharsRegex.test(charCode)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  updateImageOrderInDatabase(updatedImages: any[]) {
    // this.http.put(`https://localhost:7190/api/Users/update-image-order-and-default/${this.propID}`, updatedImages)
    //   .subscribe(
    //     response => {
    //       this.propertyInsStatus = "order updated successfully!";
    //       this.isUpdateModalOpen = true;
    this.apiurls.put(`update-image-order-and-default/${this.propID}`, updatedImages)
      .subscribe(
        response => {
          // this.propertyInsStatus = "Order updated successfully!";
          // this.isUpdateModalOpen = true;
          this.cdRef.detectChanges();
          this.isUpdateButtonEnabled=true;
        },
        error => {
          console.error('Error updating image order and default image:', error);
        }
      );
  }


  submitFloorImagesCustomOrder() {
    const validationError = this.validateOrdersfloor();
  
    if (validationError) {
      // alert(validationError); 
      // return; 
      this.propertyInsStatus = validationError;
      this.isUpdateModalOpen = true;
      return; 
    }
    const updatedImages = this.uploadedFloorImages1.map(image => ({
      id: image.id,
      imageOrder: image.customOrder.toString(),  
      defaultImage: image.DefaultImage === "1" ? "1" : "0"  
    }));
    // this.propertyInsStatus = "order submitted successfully!";
    //   this.isUpdateModalOpen = true;
      this.cdRef.detectChanges();
      this.isUpdateButtonEnabled=true;
      this.updateFloorImageOrderInDatabase(updatedImages);
  }
  
  
  updateFloorImageOrderInDatabase(updatedImages: any[]) {
    // this.http.put(`https://localhost:7190/api/Users/update-floor-image-order-and-default/${this.propID}`, updatedImages)
    //   .subscribe(
    //     response => {
    //       console.log('Image order and default image updated successfully');
          
    //       this.propertyInsStatus = "Property updated successfully!";
    //       this.isUpdateModalOpen = true;
    this.apiurls.put(`update-floor-image-order-and-default/${this.propID}`, updatedImages)
    .subscribe(
      response => {
        console.log('Image order and default image updated successfully');
        this.propertyInsStatus = "Property updated successfully!";
        this.cdRef.detectChanges();
        this.isUpdateModalOpen = true;

        },
        error => {
          console.error('Error updating image order and default image:', error);
        }
      );
  }


  areaValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (typeof value === 'number' && value >= 1500 && value <= 3500) {
      return null; 
    }
    return { invalidArea: true };
  }

  priceForValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (typeof value === 'number') {
      return null; 
    }

    const priceRangePattern = /^\d{4,5}-\d{4,5}$/; 
    if (priceRangePattern.test(value)) {
      return null; 
    }

    return { invalidPrice: true };
  }

  calculateTotalPrice() {
    const totalArea = this.propertyform.get('TotalArea')?.value;
    const priceFor = this.propertyform.get('PriceFor')?.value;

    let totalAreaMin = 0;
    let totalAreaMax = 0;
    let priceForMin = 0;
    let priceForMax = 0;

    if (totalArea && typeof totalArea === 'string' && totalArea.includes('-')) {
        const [minArea, maxArea] = totalArea.split('-').map(Number);
        totalAreaMin = minArea;
        totalAreaMax = maxArea;
    } else if (totalArea && !isNaN(totalArea)) {
        totalAreaMin = totalArea;       
        totalAreaMax = totalArea;
    }

    if (priceFor && typeof priceFor === 'string' && priceFor.includes('-')) {
        const [minPrice, maxPrice] = priceFor.split('-').map(Number);
        priceForMin = minPrice;
        priceForMax = maxPrice;
    } else if (priceFor && !isNaN(priceFor)) {
        priceForMin = priceFor;        
        priceForMax = priceFor;
    }

    if (!isNaN(totalAreaMin) && !isNaN(priceForMin) && totalAreaMin > 0 && priceForMin > 0) {
        const totalPriceMin = totalAreaMin * priceForMin;
        const totalPriceMax = totalAreaMax * priceForMax;

        if (totalPriceMin !== totalPriceMax) {
            this.propertyform.get('PropertyTotalPrice')?.setValue(`${totalPriceMin}-${totalPriceMax}`);
        } else {
            this.propertyform.get('PropertyTotalPrice')?.setValue(`${totalPriceMin}`);
        }
    } else {
        this.propertyform.get('PropertyTotalPrice')?.setValue('');
    }
}

onPageSizeInput(event: any) {
  const inputVal = +event.target.value;

  if (!event.target.value) {
    this.pageSize = 5;
    this.filteredPropertiesNotNull = false;
  } else if (inputVal > 0 && inputVal <= this.properties.length) {
    this.pageSize = inputVal;
    this.filteredPropertiesNotNull = false;
  } else {
    this.filteredPropertiesNotNull = true;
  }
}

getPaginatedProperties1() {
  return this.properties.slice(0, this.pageSize);
}

private scrolling: boolean = false;  
@HostListener('window:scroll', [])
onWindowScroll() {
  const goTopBtn = document.getElementById('goTopBtn');
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    goTopBtn?.classList.add('show');
  } else {
    goTopBtn?.classList.remove('show');
  }
}
scrollToTop() {
  if (this.scrolling) return; 
  this.scrolling = true;  
  window.scrollTo({ top: 0, behavior: 'auto' });
  setTimeout(() => {
    this.scrolling = false;
  }, 300); 
}


}

