import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuillEditorComponent, QuillModule } from 'ngx-quill'; 
import { ApiServicesService } from '../../../api-services.service';

interface Amenity {
  id: string;
  name: string;
  icon:string;
}

@Component({
  selector: 'app-add-property-by-user',
  standalone: true,
  providers: [ApiServicesService],
  imports: [ReactiveFormsModule,FormsModule,HttpClientModule,QuillModule,NgIf,NgFor,NgClass],
  templateUrl: './add-property-by-user.component.html',
  styleUrl: './add-property-by-user.component.css'
})
export class AddPropertyByUserComponent implements OnInit {
  IPAddress = '';
  isModalOpen: any;
  isVideoModalOpen:any;
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
  PropertySaleStatus: string = '';

  propID: string = '';
  selectedPropertyFiles: FileList | null = null;
  selectedPropertyFloorFiles: FileList | null = null;
  selectedPropertyVideoFiles: FileList | null = null;
  selectedPropertyDocumentFiles:FileList | null = null;
  uploadedImages: Array<{ path: string }> = [];
  uploadedFloorImages:Array<{ path: string }> = [];
  uploadedVideos:Array<{ path: string }> = [];
  uploadedDocuments:Array<{ path: string,DocumentPath:SafeResourceUrl }> = [];
  selectedImage: string = '';
  seletedVideo:string='';
  selectedCountryId: string="";
  selectedStateId: string="";
  selectedCityId: string = "";
  selectedPropertyTypeId: string = "";
  selectedPropertyForId: string = "";
  selectedPropertyFacingId:string="";
  selectedPropertystatusId:string="";
  selectedPropertyAreaId:string="";
  PropertyOnfileClicked:boolean=false;
  PropertyFloorImageOnFileClicked:boolean=false;
  PropertyVideoOnFileClicked:boolean=false;
  PropertyDocumentOnFileClicked:boolean=false;
  propertyImagesUploadedSuccesful:boolean=false;
  propertyFloorImagesUploadedSuccesful:boolean=false;
  propertyVideosUploadedSuccesful:boolean=false;
  propertyDocumentsUploadedSuccesful:boolean=false;
  propertyImagesUploadButtonClick:boolean=false;
  propertyfloorImagesUploadButtonClick:boolean=false;
  propertyVideoUploadButtonClick:boolean=false;
  propertydocumenetUploadButtonClick:boolean=false;
  isUpdateModalOpen:boolean = false;
  selectedWhoseProperties: string = '0';
  selectedPropertyStatus1: string = '';
  selectedIsActiveStatus1:string='';
  userID: string = localStorage.getItem('email') || '';
  filteredPropertiesNotNull:boolean=false;
  PropertyIsActiveStatusNotActive:boolean=false;
  currentPage = 1;
  pageSize = 4; 
  searchQuery: string = "";
  isEditing = false;
  UserIDDb:any='';
  SoldOutProperty:boolean=false;
  
  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;

  constructor(public http:HttpClient,private cdRef: ChangeDetectorRef,private sanitizer: DomSanitizer,private apiurls: ApiServicesService){}
  ngOnInit(): void {
    this.http.get<{ ip: string }>('https://api.ipify.org?format=json').subscribe({
      next: (res) => {
        this.IPAddress = res.ip;
      },
      error: (err) => {
      }
    });
    this.propertyform.get('TotalArea')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.propertyform.get('PriceFor')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.getownProperties();
    this.propertyform.valueChanges.subscribe(() => {
      this.isUpdateButtonEnabled = this.propertyform.dirty;
    });

    if(this.isUpdateButtonEnabled=true){
      this.isUpdateButtonEnabled=false;
    }
    else{
      this.isUpdateButtonEnabled=false;
    }
  }


  isFormModified() {
    return JSON.stringify(this.initialFormData) !== JSON.stringify(this.propertyform.value);
  }

  generatePropertyID() {
    const data = {
      Flag: '1'
    };
  
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations', data).subscribe({
      next: (response) => {  
        if (response && response.statusCode === 200 && response.data?.length > 0) {
          const generatedPropID = response.data[0].generatedID;
  
          this.propID = generatedPropID;
          this.propertyform.patchValue({ id: generatedPropID });
        } else {
        }
      },
      error: (error) => {
      }
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
    TotalFloors: new FormControl('', [Validators.required,Validators.pattern('^[0-9]+$'),Validators.min(1)]),    
    TotalNoOfFlats: new FormControl(''),
    BlockName: new FormControl(''),
    PropertyOnWhichFloor: new FormControl(''),
    NumberofBedrooms: new FormControl(''),
    NumberofBathrooms: new FormControl(''),
    NumberofBalconies: new FormControl(''),
    NumberofParkings: new FormControl(''),
    AreaType: new FormControl('', [Validators.required]),
    TotalArea: new FormControl('', [Validators.required, Validators.min(1)]),
    CarpetArea: new FormControl(''),
    PriceFor: new FormControl('', [Validators.required, Validators.min(1)]),
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
    const data = {
      Type: 'country'
    };
  
    this.apiurls.post<any>('Tbl_Locations_CRUD_Operations', data).subscribe({
      next: (response) => {
        this.countries = response.data;
      },
      error: (err) => {
      }
    });
  }
  
  loadStates(): void {
    if (this.selectedCountry) {
      const data = {
        Type: 'state',
        ParentId: this.selectedCountry  
      };
  
      this.apiurls.post<any>('Tbl_Locations_CRUD_Operations', data).subscribe({
        next: (response) => {
          this.states = response.data;
        },
        error: (err) => {
        }
      });
    }
  }
  
  loadCities(): void {
    if (this.selectedState) {
      const data = {
        Type: 'city',
        ParentId: this.selectedState     
      };
  
      this.apiurls.post<any>('Tbl_Locations_CRUD_Operations', data).subscribe({
        next: (response) => {
          this.cities = response.data;
        },
        error: (err) => {
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
    }
  }
}

  getPropertTypes(): void {
    const data = {
      PropertyTypeID: "",
      Name: "",
      Description: "",
      CreatedBy: "",
      CreatedIP: "",
      CreatedDate: null,
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: null,
      Flag: "3",
      Status: ""
    };
    this.apiurls.post<any>('Tbl_PropertyType_CRUD_Operations',data)
      .subscribe((response: any) => {
        if (response && Array.isArray(response.data)) {
          this.propertytypes = response.data.map((data: any) => ({
            id: data.propertyTypeID,
            name: data.name,
            description: data.description
          }));
        } else {
          this.propertytypes = [];
        }
      }, error => {
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
    const data = {
      AminitieID: "",
      name: "",
      Description: "",
      AminitieIcon:"",
      CreatedBy: "",
      CreatedIP: "",
      CreatedDate: null,
      ModifiedBy: "",
      ModifiedIP: "",
      ModifiedDate: null,
      Flag: "3",
      Status: ""
    };
    this.apiurls.post<any>('Tbl_Aminities_CRUD_Operations',data)
      .subscribe((response: any) => {
        if (response && Array.isArray(response.data)) {
          this.amenities = response.data.map((data: any) => ({
            aminitieID: data.aminitieID,
            name: data.name,
            description: data.description,
            icon:data.aminitieIcon
          }));
        } else {
          this.amenities = [];
        }
      }, error => {
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
  }

  propertyImagesClick(){
    this.propertyImagesClicked=true;
    this.propertyFloorImagesClicked=false;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=false;
    if (!this.hasImageListChanged()) {
      const propID: string = (this.propertyform.get('id')?.value).toString();
      this.getPropertyImagesForProperty(propID);
    } else {
    }
  }
  
  propertyFloorImagesClick(){
    this.propertyImagesClicked=false;
    this.propertyFloorImagesClicked=true;
    this.propertyVideosClicked=false;
    this.propertyDocumentsClicked=false;
    if (!this.hasFloorImageListChanged()) {
      const propID: string = (this.propertyform.get('id')?.value).toString();
      this.getPropertyFloorImagesForProperty(propID);
    } else {
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

uploadPropertyImages(): void {
  this.propertyImagesUploadButtonClick = true;

  if (!this.propID || !this.selectedPropertyFiles || this.selectedPropertyFiles.length === 0) {
    this.propertyImagesUploadButtonClick = false;
    return;
  }

  const formData = new FormData();
  const createdBy = localStorage.getItem('email') || 'Unknown User';
  const fileType = '1';    
  const flag = '1';       
             
  formData.append('propID', this.propID);
  formData.append('createdBy', createdBy);
  formData.append('fileType', fileType);
  formData.append('flag', flag);

  Array.from(this.selectedPropertyFiles).forEach((file: File) => {
    formData.append('images', file, file.name);
  });
  
  this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe({
    next: (response) => {
      this.PropertyOnfileClicked = false;
      this.propertyImagesUploadButtonClick = false;
      this.propertyImagesUploadedSuccesful = true;

      this.getPropertyImagesForProperty(this.propID); 

      const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = ''; 
    },
    error: (err) => {
      this.propertyImagesUploadButtonClick = false;
    }
  });
}


uploadPropertyFloorImages(): void {
  this.propertyfloorImagesUploadButtonClick = true;
  if (!this.propID || !this.selectedPropertyFloorFiles || this.selectedPropertyFloorFiles.length === 0) {
    this.propertyfloorImagesUploadButtonClick = false;
    return;
  }

  const formData = new FormData();
  formData.append('propID', this.propID);
  formData.append('fileType', '2'); 
  const createdBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('createdBy', createdBy);
  formData.append('flag', '1'); 

  Array.from(this.selectedPropertyFloorFiles).forEach((file: File) => {
    formData.append('images', file, file.name);
  });
  this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe(
    response => {
      this.PropertyFloorImageOnFileClicked = false;
      this.propertyfloorImagesUploadButtonClick = false;
      this.propertyFloorImagesUploadedSuccesful = true;
      this.getPropertyFloorImagesForProperty(this.propID); 

      const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    error => {
      this.propertyfloorImagesUploadButtonClick = false;
    }
  );
}

uploadPropertyDocuments(): void {
  this.propertydocumenetUploadButtonClick = true;
  if (!this.propID || !this.selectedPropertyDocumentFiles || this.selectedPropertyDocumentFiles.length === 0) {
    this.propertydocumenetUploadButtonClick = false;
    return;
  }
  const formData = new FormData();
  formData.append('propID', this.propID);
  formData.append('fileType', '3');  
  formData.append('flag', '1');              

  const createdBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('createdBy', createdBy);
  formData.append('modifiedBy', createdBy);

  Array.from(this.selectedPropertyDocumentFiles).forEach((file: File) => {
    formData.append('images', file, file.name); 
  });
  this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe(
    response => {
      this.PropertyDocumentOnFileClicked = false;
      this.propertydocumenetUploadButtonClick = false;
      this.propertyDocumentsUploadedSuccesful = true;
      this.getPropertyDocument(this.propID);

      const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    error => {
      this.propertydocumenetUploadButtonClick = false;
    }
  );
}


uploadPropertyVideos(): void {
  this.propertyVideoUploadButtonClick = true;
  if (!this.propID || !this.selectedPropertyVideoFiles || this.selectedPropertyVideoFiles.length === 0) {
    this.propertyVideoUploadButtonClick = false;
    return;
  }

  const formData = new FormData();
  formData.append('propID', this.propID);
  formData.append('fileType', '4');      
  formData.append('flag', '1');  

  const createdBy = localStorage.getItem('email') || 'Unknown User';
  formData.append('createdBy', createdBy);
  formData.append('modifiedBy', createdBy);
  Array.from(this.selectedPropertyVideoFiles).forEach((file: File) => {
    formData.append('images', file, file.name);
  });
  this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe(
    response => {
      this.PropertyVideoOnFileClicked = false;
      this.propertyVideoUploadButtonClick = false;
      this.propertyVideosUploadedSuccesful = true;
      this.getPropertyVideo(this.propID);  

      const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    error => {
      this.propertyVideoUploadButtonClick = false;
    }
  );
}


getPropertyImagesForProperty(propID: string): void {
  const formData = new FormData();
  formData.append('propID', propID);
  formData.append('flag', '2');      
  formData.append('fileType', '1'); 

  this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe(
    (response: any) => {
      if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
        this.uploadedImages1 = response.data.map((image: any) => {
          const imageUrls = this.apiurls.getImageUrl(image.filePath);
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
      } else {
      }
    },
    error => {
    }
  );
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
    const formData = new FormData();
    formData.append('propID', propID);
    formData.append('flag', '2');           
    formData.append('fileType', '2'); 

    this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe(
      (response: any) => {
        if (!response || !Array.isArray(response.data)) {
          return;
        }
  
        this.uploadedFloorImages1 = response.data.map((image: any) => {
          const imageUrls = this.apiurls.getImageUrl(image.filePath || image.FilePath || '');
          const customOrder = image.imageOrder ? parseInt(image.imageOrder, 10) : 0;
  
          return {
            ...image,
            propID: propID,
            imageUrls,
            ImageOrder: image.imageOrder || image.ImageOrder,
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
    const formData = new FormData();
    formData.append('propID', propID);
    formData.append('flag', '2');        
    formData.append('fileType', '4');     
  
    this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe(
      (response: any) => {
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          this.uploadedVideos1 = response.data.map((video: any) => {
            const videoUrl = this.apiurls.getImageUrl(video.filePath); 
  
            return {
              ...video,
              propID: propID,
              videoUrl 
            };
          });
        } else {
          this.uploadedVideos1 = [];
        }
      },
      error => {
      }
    );
  }
  
  getPropertyDocument(propID: string): void {
    const formData = new FormData();
    formData.append('propID', propID);
    formData.append('flag', '2');            
    formData.append('fileType', '3');        
  
    this.apiurls.post<any>('Tbl_PropFiles_CRUD_Operations', formData).subscribe(
      (response: any) => {
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          this.uploadedDocuments1 = response.data.map((doc: any) => {
            const documentUrl = this.apiurls.getImageUrl(doc.filePath);
            const safeDocumentUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
  
            return {
              ...doc,
              propID: propID,
              documentUrl,         
              safeDocumentUrl     
            };
          });
        } else {
          this.uploadedDocuments1 = [];
        }
      },
      error => {
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
      }
    }
  }
  

  deleteImage1(propertyId: string, imageId: number): void {
    const formData = new FormData();
    formData.append('flag', '4');
    formData.append('propID', propertyId);
    formData.append('imageOrderUpdateJson', JSON.stringify([{
      ID: imageId,
      PropID: propertyId,
      Flag: '4'
    }]));
  
    this.apiurls.post('Tbl_PropFiles_CRUD_Operations', formData).subscribe({
      next: (response) => {
        const index = this.uploadedImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
        if (index !== -1) {
          this.uploadedImages1.splice(index, 1);
          this.propertyInsStatus = "Image deleted successfully!";
          this.isUpdateModalOpen = true;
        }
  
        this.getPropertyImagesForProperty(this.propID);
      },
      error: (error) => {
      },
      complete: () => {
      }
    });
  }

  deleteFloorImage1(propertyId: string, imageId: number): void {
    const formData = new FormData();
    formData.append('flag', '4');
    formData.append('propID', propertyId);
    formData.append('imageOrderUpdateJson', JSON.stringify([{
      ID: imageId,
      PropID: propertyId,
      Flag: '4'
    }]));
  
    this.apiurls.post('Tbl_PropFiles_CRUD_Operations', formData).subscribe({
      next: (response: any) => {
        const index = this.uploadedFloorImages1.findIndex(image => image.id === imageId && image.propID === propertyId);
        if (index !== -1) {
          this.uploadedFloorImages1.splice(index, 1);
          this.propertyInsStatus = "Floor image deleted successfully!";
          this.isUpdateModalOpen = true;
        }
        this.getPropertyFloorImagesForProperty(this.propID);
      },
      error: (error) => {
      },
      complete: () => {
      }
    });
  }

  deleteVideo(propertyId: string, videoId: number): void {
    const formData = new FormData();
    formData.append('flag', '4');
    formData.append('propID', propertyId);
    formData.append('imageOrderUpdateJson', JSON.stringify([{
      ID: videoId,
      PropID: propertyId,
      Flag: '4'
    }]));
  
    this.apiurls.post('Tbl_PropFiles_CRUD_Operations', formData).subscribe({
      next: (response: any) => {
        const index = this.uploadedVideos1.findIndex(video => video.id === videoId && video.propID === propertyId);
        if (index !== -1) {
          this.uploadedVideos1.splice(index, 1);
          this.propertyInsStatus = "Video deleted successfully!";
          this.isUpdateModalOpen = true;
        }
        this.getPropertyVideo(this.propID);
      },
      error: (error) => {
      },
      complete: () => {
      }
    });
  }
  
  deleteDocument(propertyId: string, documentId: number): void {
    const formData = new FormData();
    formData.append('flag', '4');
    formData.append('propID', propertyId);
    formData.append('imageOrderUpdateJson', JSON.stringify([{
      ID: documentId,
      PropID: propertyId,
      Flag: '4'
    }]));
  
    this.apiurls.post('Tbl_PropFiles_CRUD_Operations', formData).subscribe({
      next: (response: any) => {
        const index = this.uploadedDocuments1.findIndex(document => document.id === documentId && document.propID === propertyId);
        if (index !== -1) {
          this.uploadedDocuments1.splice(index, 1);
          this.propertyInsStatus = "Document deleted successfully!";
          this.isUpdateModalOpen = true;
        }
        this.getPropertyDocument(this.propID);
      },
      error: (error) => {
      },
      complete: () => {
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
      }
    } else {
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
      }
    } else {
    }
  }

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
      }
    } else {
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
      }
    } else {
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

  updatePropertyIsActiveStatus(propId: string, isActiveStatus: string): void {
    const data = {
      PropID: propId,
      PropActiveStatus: isActiveStatus,  
      Flag: '11',
      ModifiedBy: localStorage.getItem('email') || '',
      ModifiedDate: new Date().toISOString(),
    };
  
    this.apiurls.post('Tbl_Properties_CRUD_Operations', data).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.propertyInsStatus = isActiveStatus === '1'
            ? 'Property marked as Active successfully!'
            : 'Property marked as Inactive successfully!';
          
          this.isUpdateModalOpen = true;
          this.getownProperties();
          this.cdRef.detectChanges();
        } else {
          this.propertyInsStatus = 'Unexpected response from server.';
          this.isUpdateModalOpen = true;
        }
      },
      error: (error) => {
        this.propertyInsStatus = 'Error updating property active status.';
        this.isUpdateModalOpen = true;
      }
    });
  }

  getTotalPropertyDet(propID: string): void {
    const data = {
      propID: propID,
      Flag: '12',
      propname: "", developedby: "", mobileNumber: "", emailID: "", address: "",
      landMark: "", country: "", state: "", City: "", NearBy: "", ZIPCode: "",
      ReraCertificateNumber: "", PropertyApprovedBy: "", PropertyType: "",
      PropertyFor: "", PropertyStatus: "", PropertyFacing: "", TotalBlocks: "",
      TotalFloors: "", NoOfFlats: "", BlockName: "", PropertyOnWhichFloor: "",
      NoOfBedrooms: "", NoOfBathrooms: "", NoOfBalconies: "", NoOfParkings: "",
      AreaType: "", TotalArea: "", CarpetArea: "", PriceFor: "", PropertyTotalPrice: "",
      AmenitiesCharges: "", MaintenanceCharges: "", CorpusFund: "", BuildYear: "",
      PossessionDate: null, ListDate: null, websiteurl: "", Pinteresturl: "", 
      Facebookurl: "", Twitterurl: "", GoogleLocationurl: "", userID: "",
      ActiveStatus: '', availabilityOptions: "", description: "", SpecificDescription: "",
      Aminities: "", CountryName: "", StateName: "", CityName: "", PropertyTypeName: "",
      PropActiveStatus: '', propertySaleStatus: "", CreatedBy: "", CreatedIP: "",
      CreatedDate: null, ModifiedBy: "", ModifiedIP: "", ModifiedDate: null,
      KeyWord: "", UserActiveStatus: '', generatedID: ""
    };
  
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations', data).subscribe(
      (response: any) => {
        if (response.statusCode === 200 && response.data && response.data.length > 0) {
          const property = response.data[0];
  
          this.UserIDDb = property.userID;
  
          const convertToDDMMYYYY = (dateStr: string | null): string => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? '' :
              `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
          };
  
          const convertToYYYYMMDD = (dateStr: string | null): string => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? '' :
              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          };
  
          const formattedPossessionDateForInput = convertToYYYYMMDD(property.possessionDate);
          const formattedListDateForInput = convertToYYYYMMDD(property.listDate);
  
          const selectedAmenitiesString = property.aminities || '';
          this.selectedAmenities = selectedAmenitiesString.split(',')
            .map((amenity: string): Amenity => {
              const [id, name, icon] = amenity.trim().split(' - ');
              return { id, name, icon };
            })
            .filter((amenity: Amenity) => amenity.id && amenity.name && amenity.icon);
  
          this.propertyform.patchValue({
            id: property.propID,
            PropertyTitle: property.propname,
            DevelopedBy: property.developedby,
            MobileNumber: property.mobileNumber,
            EmailID: property.emailID,
            Address: property.address,
            LandMark: property.landMark,
            Country: property.country,
            State: property.state,
            City: property.city,
            NearBy: property.nearBy,
            PostalCode: property.zipCode,
            CertificateNumber: property.reraCertificateNumber,
            PropertyApprovedBy: property.propertyApprovedBy,
            PropertyType: property.propertyType,
            PropertyFor: property.propertyFor,
            PropertyStatus: property.propertyStatus,
            PropertyFacing: property.propertyFacing,
            TotalBlocks: property.totalBlocks,
            TotalFloors: property.totalFloors,
            TotalNoOfFlats: property.noOfFlats,
            BlockName: property.blockName,
            PropertyOnWhichFloor: property.propertyOnWhichFloor,
            NumberofBedrooms: property.noOfBedrooms,
            NumberofBathrooms: property.noOfBathrooms,
            NumberofBalconies: property.noOfBalconies,
            NumberofParkings: property.noOfParkings,
            AreaType: property.areaType,
            TotalArea: property.totalArea,
            CarpetArea: property.carpetArea,
            PriceFor: property.priceFor,
            PropertyTotalPrice: property.propertyTotalPrice,
            AmenitiesCharges: property.amenitiesCharges,
            MaintenanceCharges: property.maintenanceCharges,
            CorpusFund: property.corpusFund,
            BuildYear: property.buildYear,
            PossessionDate: formattedPossessionDateForInput,
            ListDate: formattedListDateForInput,
            Description: property.description,
            SpecificDescription: property.specificDescription,
            WebsiteUrl: property.websiteurl,
            Pinteresturl: property.pinteresturl,
            Facebookurl: property.facebookurl,
            Twitterurl: property.twitterurl,
            GoogleLocationurl: property.googleLocationurl,
            AvailabilityOptions: property.availabilityOptions
          });
  
          this.selectedCountryId = property.country;
          this.selectedCountry = property.country;
          this.selectedState = property.state;
          this.selectedCity = property.city;
  
          this.SelectedCountryName = property.countryName;
          this.SelectedStateName = property.stateName;
          this.SelectedCityName = property.cityName;
          this.SelectedPropertyTypeName = property.propertyTypeName;
  
          this.loadStates();
          this.loadCities();
  
          this.SoldOutProperty = property.propertySaleStatus !== "1";
        }
      },
      error => {
      }
    );
  }

  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);  
      reader.onerror = reject;
      reader.readAsDataURL(blob);  
    });
  }

  submitpropertyDet() {
    Object.keys(this.propertyform.controls).forEach(key => {
      this.propertyform.get(key)?.enable();
    });
  
    if (this.propertyform.invalid) {
      return;
    }
  
    const selectedAmenitiesString = this.selectedAmenities
      .map(amenity => `${amenity.id} - ${amenity.name} - ${amenity.icon}`)
      .join(',');
  
    const now = new Date().toISOString();
    const currentUserEmail = localStorage.getItem('email') || '';
  
    const data = {
      PropID: this.propertyform.get('id')?.value || '',
      Propname: this.propertyform.get('PropertyTitle')?.value || '',
      DevelopedBy: this.propertyform.get('DevelopedBy')?.value || '',
      MobileNumber: String(this.propertyform.get('MobileNumber')?.value || ''),
      EmailID: String(this.propertyform.get('EmailID')?.value || ''),
      Address: String(this.propertyform.get('Address')?.value || ''),
      LandMark: this.propertyform.get('LandMark')?.value || '',
      Country: String(this.propertyform.get('Country')?.value || ''),
      State: String(this.propertyform.get('State')?.value || ''),
      City: String(this.propertyform.get('City')?.value || ''),
      NearBy: String(this.propertyform.get('NearBy')?.value || ''),
      ZIPCode: String(this.propertyform.get('PostalCode')?.value || ''),
      ReraCertificateNumber: this.propertyform.get('CertificateNumber')?.value || '',
      PropertyApprovedBy: this.propertyform.get('PropertyApprovedBy')?.value || '',
      PropertyType: String(this.propertyform.get('PropertyType')?.value || ''),
      PropertyFor: String(this.propertyform.get('PropertyFor')?.value || ''),
      PropertyStatus: String(this.propertyform.get('PropertyStatus')?.value || ''),
      PropertyFacing: String(this.propertyform.get('PropertyFacing')?.value || ''),
      TotalBlocks: String(this.propertyform.get('TotalBlocks')?.value || ''),
      TotalFloors: String(this.propertyform.get('TotalFloors')?.value || ''),
      NoOfFlats: String(this.propertyform.get('TotalNoOfFlats')?.value || ''),
      BlockName: this.propertyform.get('BlockName')?.value || '',
      PropertyOnWhichFloor: String(this.propertyform.get('PropertyOnWhichFloor')?.value || ''),
      NoOfBedrooms: String(this.propertyform.get('NumberofBedrooms')?.value || ''),
      NoOfBathrooms: String(this.propertyform.get('NumberofBathrooms')?.value || ''),
      NoOfBalconies: String(this.propertyform.get('NumberofBalconies')?.value || ''),
      NoOfParkings: String(this.propertyform.get('NumberofParkings')?.value || ''),
      AreaType: String(this.propertyform.get('AreaType')?.value || ''),
      TotalArea: String(this.propertyform.get('TotalArea')?.value || ''),
      CarpetArea: String(this.propertyform.get('CarpetArea')?.value || ''),
      PriceFor: String(this.propertyform.get('PriceFor')?.value || ''),
      PropertyTotalPrice: String(this.propertyform.get('PropertyTotalPrice')?.value || ''),
      AmenitiesCharges: String(this.propertyform.get('AmenitiesCharges')?.value || ''),
      MaintenanceCharges: String(this.propertyform.get('MaintenanceCharges')?.value || ''),
      CorpusFund: String(this.propertyform.get('CorpusFund')?.value || ''),
      BuildYear: String(this.propertyform.get('BuildYear')?.value || ''),
      PossessionDate: this.propertyform.get('PossessionDate')?.value
        ? new Date(this.propertyform.get('PossessionDate')?.value).toISOString()
        : null,
      ListDate: this.propertyform.get('ListDate')?.value
        ? new Date(this.propertyform.get('ListDate')?.value).toISOString()
        : null,
      Description: String(this.propertyform.get('Description')?.value || ''),
      SpecificDescription: String(this.propertyform.get('SpecificDescription')?.value || ''),
      Aminities: selectedAmenitiesString,
      WebsiteUrl: String(this.propertyform.get('WebsiteUrl')?.value || ''),
      Pinteresturl: String(this.propertyform.get('Pinteresturl')?.value || ''),
      Facebookurl: String(this.propertyform.get('Facebookurl')?.value || ''),
      Twitterurl: String(this.propertyform.get('Twitterurl')?.value || ''),
      GoogleLocationurl: String(this.propertyform.get('GoogleLocationurl')?.value || ''),
      AvailabilityOptions: String(this.propertyform.get('AvailabilityOptions')?.value || ''),
      UserID: currentUserEmail,
      CreatedBy: currentUserEmail,
      CreatedIP: this.IPAddress,
      CreatedDate: now,
      ActiveStatus: '0',
      CountryName: this.SelectedCountryName || '',
      StateName: this.SelectedStateName || '',
      CityName: this.SelectedCityName || '',
      PropertyTypeName: this.SelectedPropertyTypeName || '',
      PropActiveStatus: '1',
      PropertySaleStatus: '0',
      Flag: '2',
      Status: '',
      GeneratedID: '',
      KeyWord: '',
      UserActiveStatus: '1'
    };  
    this.apiurls.post("Tbl_Properties_CRUD_Operations", data).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          const orderValidationError = this.validateOrders();
          if (orderValidationError) {
            alert(orderValidationError);
            return;
          }
  
          const validationFloorError = this.validateOrdersfloor();
          if (validationFloorError) {
            alert(validationFloorError);
            return;
          }
  
          this.uploadPropertyImages();
          this.uploadPropertyFloorImages();
          this.uploadPropertyVideos();
          this.uploadPropertyDocuments();
          this.propertyInsStatus = "Property submitted successfully!";
          this.isUpdateModalOpen = true;
          this.propertyImagesClicked=false;
          this.propertyFloorImagesClicked=false;
          this.propertyVideosClicked=false;
          this.propertyDocumentsClicked=false;
          this.editclicked = false;
          this.addnewPropertyclicked = false;
          this.cdRef.detectChanges();
        } else {
        }
      },
      error: (error) => {
        this.propertyInsStatus = "Error Inserting Property.";
        this.isUpdateModalOpen = true;
      }
    });
  }

  checkForChanges() {
    this.isUpdateButtonEnabled = this.propertyform.dirty;
  }

updatePropertyDet() {
  Object.keys(this.propertyform.controls).forEach(key => {
    this.propertyform.get(key)?.enable();
  });

  if (this.propertyform.invalid) {
    return;
  }

  const selectedAmenitiesString = this.selectedAmenities
    .map(amenity => `${amenity.id} - ${amenity.name} - ${amenity.icon}`)
    .join(',');

  const now = new Date().toISOString();
  const currentUserEmail = localStorage.getItem('email') || '';


  const data = {
    id: 0,
    PropID: this.propertyform.get('id')?.value || '',
    Propname: this.propertyform.get('PropertyTitle')?.value || '',
    DevelopedBy: this.propertyform.get('DevelopedBy')?.value || '',
    MobileNumber: String(this.propertyform.get('MobileNumber')?.value || ''),
    EmailID: String(this.propertyform.get('EmailID')?.value || ''),
    Address: String(this.propertyform.get('Address')?.value || ''),
    LandMark: this.propertyform.get('LandMark')?.value || '',
    Country: String(this.propertyform.get('Country')?.value || ''),
    State: String(this.propertyform.get('State')?.value || ''),
    City: String(this.propertyform.get('City')?.value || ''),
    NearBy: String(this.propertyform.get('NearBy')?.value || ''),
    ZIPCode: String(this.propertyform.get('PostalCode')?.value || ''),
    ReraCertificateNumber: this.propertyform.get('CertificateNumber')?.value || '',
    PropertyApprovedBy: this.propertyform.get('PropertyApprovedBy')?.value || '',
    PropertyType: String(this.propertyform.get('PropertyType')?.value || ''),
    PropertyFor: String(this.propertyform.get('PropertyFor')?.value || ''),
    PropertyStatus: String(this.propertyform.get('PropertyStatus')?.value || ''),
    PropertyFacing: String(this.propertyform.get('PropertyFacing')?.value || ''),
    TotalBlocks: String(this.propertyform.get('TotalBlocks')?.value || ''),
    TotalFloors: String(this.propertyform.get('TotalFloors')?.value || ''),
    NoOfFlats: String(this.propertyform.get('TotalNoOfFlats')?.value || ''),
    BlockName: this.propertyform.get('BlockName')?.value || '',
    PropertyOnWhichFloor: String(this.propertyform.get('PropertyOnWhichFloor')?.value || ''),
    NoOfBedrooms: String(this.propertyform.get('NumberofBedrooms')?.value || ''),
    NoOfBathrooms: String(this.propertyform.get('NumberofBathrooms')?.value || ''),
    NoOfBalconies: String(this.propertyform.get('NumberofBalconies')?.value || ''),
    NoOfParkings: String(this.propertyform.get('NumberofParkings')?.value || ''),
    AreaType: String(this.propertyform.get('AreaType')?.value || ''),
    TotalArea: String(this.propertyform.get('TotalArea')?.value || ''),
    CarpetArea: String(this.propertyform.get('CarpetArea')?.value || ''),
    PriceFor: String(this.propertyform.get('PriceFor')?.value || ''),
    PropertyTotalPrice: String(this.propertyform.get('PropertyTotalPrice')?.value || ''),
    AmenitiesCharges: String(this.propertyform.get('AmenitiesCharges')?.value || ''),
    MaintenanceCharges: String(this.propertyform.get('MaintenanceCharges')?.value || ''),
    CorpusFund: String(this.propertyform.get('CorpusFund')?.value || ''),
    BuildYear: String(this.propertyform.get('BuildYear')?.value || ''),
    PossessionDate: this.propertyform.get('PossessionDate')?.value
      ? new Date(this.propertyform.get('PossessionDate')?.value).toISOString()
      : null,
    ListDate: this.propertyform.get('ListDate')?.value
      ? new Date(this.propertyform.get('ListDate')?.value).toISOString()
      : null,
    Description: String(this.propertyform.get('Description')?.value || ''),
    SpecificDescription: String(this.propertyform.get('SpecificDescription')?.value || ''),
    Aminities: selectedAmenitiesString,
    WebsiteUrl: String(this.propertyform.get('WebsiteUrl')?.value || ''),
    Pinteresturl: String(this.propertyform.get('Pinteresturl')?.value || ''),
    Facebookurl: String(this.propertyform.get('Facebookurl')?.value || ''),
    Twitterurl: String(this.propertyform.get('Twitterurl')?.value || ''),
    GoogleLocationurl: String(this.propertyform.get('GoogleLocationurl')?.value || ''),
    AvailabilityOptions: String(this.propertyform.get('AvailabilityOptions')?.value || ''),
    ModifiedBy: currentUserEmail,
    ModifiedIP: this.IPAddress,
    ModifiedDate: now,
    ActiveStatus: '',
    CountryName: this.SelectedCountryName || '',
    StateName: this.SelectedStateName || '',
    CityName: this.SelectedCityName || '',
    PropertyTypeName: this.SelectedPropertyTypeName || '',
    PropActiveStatus: '',
    PropertySaleStatus: '',
    Flag: '11',
    Status: '',
    GeneratedID: '',
    KeyWord: '',
    UserActiveStatus: ''
  };

  this.apiurls.post("Tbl_Properties_CRUD_Operations", data).subscribe({
    next: (response: any) => {
      if (response.statusCode == "200") {
        this.uploadPropertyImages();

        const validationError = this.validateOrders();
        if (validationError) {
          this.propertyInsStatus = validationError;
          this.isUpdateModalOpen = true;
          return;
        }

        const updatedImages = this.uploadedImages1.map(image => ({
          ID: image.id,
          PropID: this.propID,
          ImageOrder: image.customOrder.toString(),
          Flag: "3"
        }));
        this.updateImageOrderInDatabase(updatedImages);
        this.uploadPropertyFloorImages();

        const validationFloorError = this.validateOrdersfloor();
        if (validationFloorError) {
          this.propertyInsStatus = validationFloorError;
          this.isUpdateModalOpen = true;
          return;
        }

        const uploadedFloorImages = this.uploadedFloorImages1.map(image => ({
          id: image.id,
          imageOrder: image.customOrder.toString(),
          defaultImage: image.DefaultImage === "1" ? "1" : "0"
        }));
        this.updateFloorImageOrderInDatabase(uploadedFloorImages);

        this.uploadPropertyVideos();
        this.uploadPropertyDocuments();

        this.propertyInsStatus = "Property updated successfully!";
        this.isUpdateModalOpen = true;
        this.editclicked = false;
        this.addnewPropertyclicked = false;
        this.isOrderSubmitEnabled = true;
        this.cdRef.detectChanges();
      } else {
      }
    },
    error: (error) => {
      this.propertyInsStatus = "Error Updating Property.";
      this.isUpdateModalOpen = true;
    }
  });
}

isOrderSubmitEnabled: boolean = false;

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

  getownProperties(): void {
    if (!this.userID) {
      this.properties = [];
      return;
    }
  
    const data = {
      Flag: '13',
      userID: this.userID,
    };
  
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations', data).subscribe({
      next: (res: any) => {
        const responseData = res?.data || [];
        const propertiesMap = new Map<string, any>();
  
        responseData.forEach((item: any) => {
          const propID = item?.propID;
          if (!propID) return;
  
          if (!propertiesMap.has(propID)) {
            const PropertyStatus = item.activeStatus === '2' ? 'Not Approved'
                                  : item.activeStatus === '1' ? 'Approved'
                                  : 'Pending';
  
            const PropertyIsActiveStatus = item.propActiveStatus === '1' ? 'Active'
                                           : item.propActiveStatus === '0' ? 'Inactive'
                                           : 'Unknown';
  
            const PropertySaleStatus = item.propertySaleStatus === '1' || item.propertySaleStatus === 1
                                      ? 'Sold Out'
                                      : 'Unsold';
  
            propertiesMap.set(propID, {
              propID,
              propname: item.propname || '',
              developedby: item.developedby || '',
              status: PropertyStatus,
              IsActiveStatus: PropertyIsActiveStatus,
              IsActiveStatusBoolean: item.propActiveStatus,
              SaleStatus: PropertySaleStatus,
              images: [],
            });
          }
  
          if (item.id && item.fileName) {
            propertiesMap.get(propID).images.push({
              ImageID: item.id,
              FileName: item.fileName,
              FilePath: item.filePath,
              ImageOrder: item.imageOrder,
            });
          }
        });
  
        this.properties = Array.from(propertiesMap.values());
      },
      error: (err) => {
        this.properties = [];
      },
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
    });
    
  }

  get filteredProperties() {
    return this.properties.filter(property => 
      property.propID.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.propname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      property.developedby.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
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
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
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
      this.getownProperties();
    }
    this.searchQuery = '';
  }

  declineProperty(){
    const PropId=this.propertyform.get('id')?.value
    this.updatePropertyStatus(PropId,'2');
  }


  selectAll(): void {
    this.selectedAmenities = this.amenities.map(amenity => ({
      id: amenity.aminitieID,
      name: amenity.name,
      icon: amenity.icon
    }));
    this.checkIfUpdateButtonShouldBeEnabled();
  }
  
  deselectAll(): void {
    this.selectedAmenities = [];
    this.checkIfUpdateButtonShouldBeEnabled();
  }

  checkIfUpdateButtonShouldBeEnabled(): void {
    this.isUpdateButtonEnabled = this.selectedAmenities.length > 0;
  }
  
  updatePropertyStatus(propId: string, status: string): void {
    const data = {
      PropID: propId,
      ActiveStatus: status,
      Flag: '11',
      ModifiedBy: localStorage.getItem('email') || '',
      ModifiedDate: new Date().toISOString(),
    };
  
    this.apiurls.post('Tbl_Properties_CRUD_Operations', data).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.propertyInsStatus = 'Property status updated successfully!';
          this.isUpdateModalOpen = true;
          this.editclicked = false;
          this.addnewPropertyclicked = false;
  
          this.getownProperties();
          this.cdRef.detectChanges();
        } else {
          this.propertyInsStatus = 'Unexpected response from server.';
          this.isUpdateModalOpen = true;
        }
      },
      error: (error) => {
        this.propertyInsStatus = 'Error updating property status.';
        this.isUpdateModalOpen = true;
      }
    });
  }

  getPropertyDetailsByStatus(status: string): void {
    const requestBody = {
      ActiveStatus: status,
      Flag: '9'
    };
  
    this.apiurls.post<any>('Tbl_Properties_CRUD_Operations', requestBody)
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
            SaleStatus: PropertySaleStatus
          };
        });
      }, error => {
      });
  }

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
          IsActiveStatusBoolean:property.propActiveStatus,
          SaleStatus: property.propertySaleStatus === "1" ? "Sold Out" : "Unsold"

        }));
        this.properties.forEach(property => {
        });
        this.filteredPropertiesNotNull=false;
      } else if (response.statusCode === 404) {
        this.filteredPropertiesNotNull=true;
      } else {
        this.properties = [];
      }
    }, error => {
      this.filteredPropertiesNotNull = true;
      this.properties = [];
    });
  }

  onWhosePropertySelectionChange(event: any): void {
  this.selectedWhoseProperties = event.target.value;
  this.applyFilters();
  }

  onWhosePropertyStatusSelectionChange(event: any): void {
    let selectedStatus = event.target.value;
  
    if (selectedStatus == "0") {
      this.selectedPropertyStatus1 = '0';  
      this.selectedIsActiveStatus1 = '';  
    } 
    else if (selectedStatus == "1" || selectedStatus == "2") {
      this.selectedPropertyStatus1 = selectedStatus;  
      this.selectedIsActiveStatus1 = '';  
    } 
    else if (selectedStatus == "3") {
      this.selectedIsActiveStatus1 = "1"; 
      this.selectedPropertyStatus1 = '';  
    }

    else if (selectedStatus == "4") {
      this.selectedIsActiveStatus1 = "0";  
      this.selectedPropertyStatus1 = '';  
    }
  
    this.applyFilters();
  }
  
  applyFilters(): void {
    this.fetchFilteredProperties(this.selectedWhoseProperties, this.selectedPropertyStatus1, this.selectedIsActiveStatus1, this.searchQuery);
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
      case '0': return 'Not Active';
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
      this.getownProperties();
    }
    
  }

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
  
  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
    ],
  };

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
  
  updateDefaultImageInDatabase(propID: string, imageID: number): void {
    const endpoint = `update-default-image/${propID}/${imageID}`;
    this.apiurls.put(endpoint, {}).subscribe(
        response => {
        },
        error => {
        }
    );
}
  
  validateOrders(): string | null {
    const seenOrders = new Set<number>();
    const orderNumbers = this.uploadedImages1.map(image => image.customOrder).sort((a, b) => a - b);
  
    for (let i = 0; i < orderNumbers.length; i++) {
      if (seenOrders.has(orderNumbers[i])) {
        this.propertyInsStatus = 'There are duplicate order numbers. Please ensure all order numbers are unique in Images.';
        this.isUpdateModalOpen = true; 
        return this.propertyInsStatus;
      }
  
      if (i > 0 && orderNumbers[i] !== orderNumbers[i - 1] + 1) {
        this.propertyInsStatus = 'Order numbers must be in sequence (no gaps). Please correct the sequence in Images.';
        this.isUpdateModalOpen = true; 
        return this.propertyInsStatus;
      }
  
      seenOrders.add(orderNumbers[i]);
    }
  
    return null; 
  }
  
  submitCustomOrder() {
    const validationError = this.validateOrders();
  
    if (validationError) {
      this.propertyInsStatus = validationError;
      this.isUpdateModalOpen = true;
      return; 
    }
    const updatedImages = this.uploadedImages1.map(image => ({
      id: image.id,
      imageOrder: image.customOrder.toString(), 
      defaultImage: image.DefaultImage === "1" ? "1" : "0"  
    }));
  
    this.isUpdateButtonEnabled = true;
    this.updateImageOrderInDatabase(updatedImages);
  }
  
  updateImageOrderInDatabase(updatedImages: any[]) {
    const formData = new FormData();
    formData.append("flag", "3");
    formData.append("propID", this.propID);
    formData.append("imageOrderUpdateJson", JSON.stringify(updatedImages));
  
    this.apiurls.post("Tbl_PropFiles_CRUD_Operations", formData).subscribe({
      next: (response) => {
        this.cdRef.detectChanges();
        this.isUpdateButtonEnabled = true;
      },
      error: (error) => {
      }
    });
  }

  onOrderChange(): void {
    const validationError = this.validateOrders();
    if (!validationError) {
      this.isUpdateButtonEnabled = true;
    } else {
      this.isUpdateButtonEnabled = false;
    }
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
        this.propertyInsStatus = 'Order numbers must be in sequence (no gaps). Please correct the sequence in floorimage.';
        this.isUpdateModalOpen = true; 
        return this.propertyInsStatus;
      }
  
      seenOrders.add(orderNumbers[i]);
    }
  
    if (hasDuplicate) {
      this.propertyInsStatus = 'There are duplicate order numbers. Please ensure all order numbers are unique in floorimage.';
      this.isUpdateModalOpen = true; 
      return this.propertyInsStatus;
    }
  
    return null;  
  }
  submitFloorImagesCustomOrder() {
    const validationError = this.validateOrdersfloor();
  
    if (validationError) {
      this.propertyInsStatus = validationError;
      this.isUpdateModalOpen = true;
      return; 
    }
    const updatedImages = this.uploadedFloorImages1.map(image => ({
      id: image.id,
      imageOrder: image.customOrder.toString(),  
      defaultImage: image.DefaultImage === "1" ? "1" : "0"  
    }));
    this.updateFloorImageOrderInDatabase(updatedImages);
  }
  
  updateFloorImageOrderInDatabase(updatedImages: any[]) {
      this.apiurls.put(`update-floor-image-order-and-default/${this.propID}`, updatedImages)
      .subscribe(
        response => {
          this.propertyInsStatus = "Property updated successfully!";
          this.cdRef.detectChanges();
          this.isUpdateModalOpen = true;
        },
        error => {
        }
      );
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

  OnlyNumbersAllowed1(event: KeyboardEvent): boolean {
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
  
  OnlyNumbersandAllowed(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    if ((charCode >= 48 && charCode <= 57) || charCode === 45 || charCode === 8) {
      if (charCode === 45 && (value.includes('-') || value === '')) {
        return false;
      }
      let lastChar = value.charAt(value.length - 1);
      if (charCode === 45 && lastChar === '-') {
        return false;
      }
  
      return true;
    }
    return false;
  }


  OnlyNumbersAllowed2(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  validateLength(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4); 
    }
  }
  OnlyNumbersAllowed(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    if ((charCode >= 48 && charCode <= 57) || charCode === 8 || charCode === 46) {
      return true;
    }
    
    return false;
  }
  
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
        if (parts.length === 1 && parts[0].length >= 1 && parts[0].length <= 6) {
            return;
        }
        if (parts.length > 1) {
            event.preventDefault();
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
  if (inputChar === '-') {
    const parts = currentValue.split('-');
    if (parts.length === 1 && parts[0].length >= 1 && parts[0].length <= 6) {
        return;
    }
    if (parts.length > 1) {
        event.preventDefault();
    }
}
event.preventDefault();
}
  
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
  
 
  OnlyValidEmailChars(event: KeyboardEvent): boolean {
    const charCode = event.key;
    const allowedCharsRegex = /^[a-zA-Z0-9@._+-]$/;
    if (!allowedCharsRegex.test(charCode)) {
      event.preventDefault();
      return false;
    }
    return true;
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

SoldOutPropertyClick(){
  const PropId=this.propertyform.get('id')?.value
  this.updatePropertySoldOutStatus(PropId,'1');
}

UnSoldPropertyClick(){
  const PropId=this.propertyform.get('id')?.value
  this.updatePropertySoldOutStatus(PropId,'0');
}

updatePropertySoldOutStatus(propId: string, SoldOutStatus: string): void {
  const data = {
    PropID: propId,
    propertySaleStatus: SoldOutStatus,  
    Flag: '11',                         
    ModifiedBy: localStorage.getItem('email') || '',
    ModifiedDate: new Date().toISOString(),
  };

  this.apiurls.post('Tbl_Properties_CRUD_Operations', data).subscribe({
    next: (response: any) => {
      if (response.statusCode === 200) {
        this.propertyInsStatus = SoldOutStatus === '1'
          ? 'Property marked as Sold Out successfully!'
          : 'Property marked as Unsold successfully!';

        this.isUpdateModalOpen = true;
        this.editclicked = false;
        this.addnewPropertyclicked = false;
        this.getownProperties();
        this.cdRef.detectChanges();
      } else {
        this.propertyInsStatus = 'Unexpected response from server.';
        this.isUpdateModalOpen = true;
      }
    },
    error: (error) => {
      this.propertyInsStatus = 'Error updating property sale status.';
      this.isUpdateModalOpen = true;
    }
  });
}
onSearchChange(): void {
  this.currentPage = 1;
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
