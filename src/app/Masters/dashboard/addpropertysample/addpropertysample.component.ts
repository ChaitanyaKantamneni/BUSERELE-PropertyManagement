import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-addpropertysample',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule,NgFor,NgClass,NgIf,FormsModule],
  templateUrl: './addpropertysample.component.html',
  styleUrls: ['./addpropertysample.component.css']
})
export class AddpropertysampleComponent implements OnInit {

  constructor(private apihttp: HttpClient) {}

  ngOnInit(): void {
    this.propertyform.get('TotalArea')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.propertyform.get('PriceFor')?.valueChanges.subscribe(() => this.calculateTotalPrice());
    this.fetchProperties();
  }

  generatePropertyID(){
    this.apihttp.get("https://localhost:7190/api/Users/getautopropertyID", { responseType: 'text' }).subscribe((response: string) => {
      this.propID = response;
      this.propertyform.patchValue({ id: response });
      console.log('Generated Property ID:', response);
    }, error => {
      console.error('Error fetching property ID:', error);
    });
  }

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

  propertyInsStatus: any = '';

  // Initialize the form group with controls
  propertyform: FormGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl(),
    developedby: new FormControl(),
    listdate: new FormControl(),
    areaType: new FormControl(),
    mobileNumber:new FormControl(),
    emailID:new FormControl(),
    address:new FormControl(),
    landMark:new FormControl(),
    country:new FormControl(),
    state:new FormControl(),
    City:new FormControl(),
    NearBy:new FormControl(),
    ZIPCode:new FormControl(),
    ReraCertificateNumber:new FormControl(),
    PropertyApprovedBy:new FormControl(),
    PropertyType:new FormControl(),
    PropertyFor:new FormControl(),
    PropertyStatus:new FormControl(),
    PropertyFacing:new FormControl(),
    TotalBlocks:new FormControl(),
    TotalFloors:new FormControl(),
    NoOfFlats:new FormControl(),
    BlockName:new FormControl(),
    PropertyOnWhichFloor:new FormControl(),
    NoOfBedrooms:new FormControl(),
    NoOfBathrooms:new FormControl(),
    NoOfBalconies:new FormControl(),
    NoOfParkings:new FormControl(),
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
    websiteurl:new FormControl(),
    Pinteresturl: new FormControl(),
    Facebookurl:new FormControl(),
    Twitterurl:new FormControl(),
    GoogleLocationurl:new FormControl(),
    availabilityOptions:new FormControl()
  });

  submitproperty() {
    this.submitpropertyDet();
    this.uploadImages();
  }
   


  selectedFiles: FileList | null = null;
  selectedFeaturedFiles:FileList|null=null;  
  uploadedImages: Array<{ path: string }> = [];
  uploadedImages1: Array<{ id: number, propID: string, fileName: string, mimeType: string, imageData: Blob, imageUrl: string }> = [];
  uploadedFeaturedImages1: Array<{ id: number, propID: string, fileName: string, mimeType: string, imageData: Blob, imageUrl: string }> = [];

  isModalOpen = false;
  selectedImage: string = '';
  propID: string = '';
  editclicked: boolean = false;
  addnewPropertyclicked:boolean=false;
  properties: Array<{ propID: string, propname: string, developedby: string }> = [];
  fetchProperties(): void {
    this.apihttp.get('https://localhost:7190/api/Users/GetAllPropertyDetails')  // Adjust the API endpoint accordingly
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

  // Handle file selection and display image preview
  onFileSelect(event: any): void {
    if (event?.target?.files) {
      this.selectedFiles = event.target.files;

      if (this.selectedFiles && this.selectedFiles.length > 0) {
        this.uploadedImages = [];  // Clear previous images

        // Convert FileList to an array and create image previews
        Array.from(this.selectedFiles).forEach((file: File) => {
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

  // Handle image upload to backend
  uploadImages(): void {
    console.log(this.propID);
    if (!this.propID || !this.selectedFiles || this.selectedFiles.length === 0) {
      alert('Property ID is required and you must select images.');
      return;
    }

    console.log(this.propID);

    const formData = new FormData();
    formData.append('propID', this.propID);

    // Append each selected file to formData
    Array.from(this.selectedFiles).forEach((file: File) => {
      formData.append('images', file, file.name);
    });

    // Make HTTP request to upload the files
    this.apihttp.post('https://localhost:7190/api/Users/upload', formData).subscribe(
      response => {
        console.log('Images uploaded successfully:', response);
        this.getImagesForProperty(this.propID);  // Refresh the images after upload
      },
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  uploadFeaturedImages(): void {
    console.log(this.propID);
    if (!this.propID || !this.selectedFiles || this.selectedFiles.length === 0) {
      alert('Property ID is required and you must select images.');
      return;
    }

    console.log(this.propID);

    const formData = new FormData();
    formData.append('propID', this.propID);

    // Append each selected file to formData
    Array.from(this.selectedFiles).forEach((file: File) => {
      formData.append('images', file, file.name);
    });

    // Make HTTP request to upload the files
    this.apihttp.post('https://localhost:7190/api/Users/upload', formData).subscribe(
      response => {
        console.log('Images uploaded successfully:', response);
        this.getFeaturedImagesForProperty(this.propID);  // Refresh the images after upload
      },
      error => {
        console.error('Upload failed:', error);
      }
    );
  }

  // Open the modal to view image
  openModal(imagePath: string): void {
    this.selectedImage = imagePath;  // Set the selected image path
    this.isModalOpen = true;  // Show the modal
  }

  // Close the modal
  closeModal(): void {
    this.isModalOpen = false;  // Hide the modal
    this.selectedImage = '';  // Clear the selected image path
  }

  // Delete an image from the uploaded list
  deleteImage(image: any): void {
    const index = this.uploadedImages.indexOf(image);

    console.log(index);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1); // Remove image from table
    }
  }
  

  deleteImage1(propertyId: string, imageId: number): void {
    this.apihttp.delete(`https://localhost:7190/api/Users/delete-image/${propertyId}/${imageId}`, {
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
        this.getImagesForProperty(this.propID);
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

  deleteFeaturedImage1(propertyId: string, imageId: number): void {
    this.apihttp.delete(`https://localhost:7190/api/Users/delete-image/${propertyId}/${imageId}`, {
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
        this.getImagesForProperty(this.propID);
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

  
  editproperty(propertyID: string): void {
    this.editclicked = true;
    this.propID = propertyID;  
    this.getTotalPropertyDet(propertyID);
  }

  getTotalPropertyDet(propID: string):void{
    this.apihttp.get(`https://localhost:7190/api/Users/GetPropertyDetailsById/${propID}`).subscribe((response: any) => {
      this.propertyform.patchValue({
        id: response.propID,
        name: response.propname,
        developedby: response.developedby,
        listdate: response.createdDate,
        areaType: response.areaType1,
        mobileNumber: response.mobileNumber,
        emailID: response.emailID,
        address: response.address,
        landMark: response.landMark,
        country: response.country,
        state: response.state,
        City: response.city,
        NearBy: response.nearBy,
        ZIPCode: response.zipCode,
        ReraCertificateNumber: response.reraCertificateNumber,
        PropertyApprovedBy: response.propertyApprovedBy,
        PropertyType: response.propertyType,
        PropertyFor: response.propertyFor,
        PropertyStatus: response.propertyStatus,
        PropertyFacing: response.propertyFacing,
        TotalBlocks: response.totalBlocks,
        TotalFloors: response.totalFloors,
        NoOfFlats: response.noOfFlats,
        BlockName: response.blockName,
        PropertyOnWhichFloor: response.propertyOnWhichFloor,
        NoOfBedrooms: response.noOfBedrooms,
        NoOfBathrooms: response.noOfBathrooms,
        NoOfBalconies: response.noOfBalconies,
        NoOfParkings: response.noOfParkings,
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
        websiteurl: response.websiteurl,
        Pinteresturl: response.pinteresturl,
        Facebookurl: response.facebookurl,
        Twitterurl: response.twitterurl,
        GoogleLocationurl: response.googleLocationurl,
        availabilityOptions: response.availabilityOptions
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
        imageUrl // Add the Blob URL to the image object
      };
    });

    console.log('Processed image array:', this.uploadedImages1);
  }, error => {
    console.error('Error fetching images:', error);
  });
  }
  getImagesForProperty(propID: string): void {
    this.apihttp.get(`https://localhost:7190/api/Users/get-images/${propID}`).subscribe((response: any) => {
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

  getFeaturedImagesForProperty(propID: string): void {
    this.apihttp.get(`https://localhost:7190/api/Users/get-images/${propID}`).subscribe((response: any) => {
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

  submitpropertyDet(){
    const data = {
      id: 0,
      propID: this.propertyform.get('id')?.value,
      propname: this.propertyform.get('name')?.value,
      developedby: this.propertyform.get('developedby')?.value,
      createdDate: new Date(this.propertyform.get('listdate')?.value).toISOString(),
      areaType1:new String(this.propertyform.get('areaType')?.value).toString(),
      mobileNumber:new String(this.propertyform.get('mobileNumber')?.value).toString(),
      emailID:new String(this.propertyform.get('emailID')?.value).toString(),
      address:new String(this.propertyform.get('address')?.value).toString(),
      landMark:this.propertyform.get('landMark')?.value,
      country:new String(this.propertyform.get('country')?.value).toString(),
      state:new String(this.propertyform.get('state')?.value).toString(),
      City:this.propertyform.get('City')?.value,
      NearBy:this.propertyform.get('NearBy')?.value,
      ZIPCode:new String(this.propertyform.get('ZIPCode')?.value).toString(),
      ReraCertificateNumber:this.propertyform.get('ReraCertificateNumber')?.value,
      PropertyApprovedBy:this.propertyform.get('PropertyApprovedBy')?.value,
      PropertyType:new String(this.propertyform.get('PropertyType')?.value).toString(),
      PropertyFor:new String(this.propertyform.get('PropertyFor')?.value).toString(),
      PropertyStatus:new String(this.propertyform.get('PropertyStatus')?.value).toString(),
      PropertyFacing:new String(this.propertyform.get('PropertyFacing')?.value).toString(),
      TotalBlocks:new String(this.propertyform.get('TotalBlocks')?.value).toString(),
      TotalFloors:new String(this.propertyform.get('TotalFloors')?.value).toString(),
      NoOfFlats:new String(this.propertyform.get('NoOfFlats')?.value).toString(),
      BlockName:this.propertyform.get('BlockName')?.value,
      PropertyOnWhichFloor:new String(this.propertyform.get('PropertyOnWhichFloor')?.value).toString(),
      NoOfBedrooms:new String(this.propertyform.get('NoOfBedrooms')?.value).toString(),
      NoOfBathrooms:new String(this.propertyform.get('NoOfBathrooms')?.value).toString(),
      NoOfBalconies:new String(this.propertyform.get('NoOfBalconies')?.value).toString(),
      NoOfParkings:new String(this.propertyform.get('NoOfParkings')?.value).toString(),
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
      websiteurl:new String(this.propertyform.get('websiteurl')?.value).toString() || null,
      Pinteresturl:new String(this.propertyform.get('Pinteresturl')?.value).toString() || null,
      Facebookurl:new String(this.propertyform.get('Facebookurl')?.value).toString() || null,
      Twitterurl:new String(this.propertyform.get('Twitterurl')?.value).toString() || null,
      GoogleLocationurl:new String(this.propertyform.get('GoogleLocationurl')?.value).toString() || null,
      availabilityOptions:new String(this.propertyform.get('availabilityOptions')?.value).toString(),
      userID:new String(localStorage.getItem('email')).toString(),
      ActiveStatus:"0"
    };

    console.log('Form Data:', this.propertyform.value);
    console.log('Area Type:', this.propertyform.get('areaType')?.value);
    console.log('country:', this.propertyform.get('country')?.value);
    console.log('state:', this.propertyform.get('state')?.value);
    console.log('availability Options:', this.propertyform.get('availabilityOptions')?.value);

    // Send the data to the API via POST request
    this.apihttp.post("https://localhost:7190/api/Users/inspropertysample", data, {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: (response: any) => {
        // If successful, show the success message
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
      propname: this.propertyform.get('name')?.value,
      developedby: this.propertyform.get('developedby')?.value,
      createdDate: this.propertyform.get('listdate')?.value ? new Date(this.propertyform.get('listdate')?.value).toISOString() : null,
      areaType1: this.propertyform.get('areaType')?.value || '',
      mobileNumber: this.propertyform.get('mobileNumber')?.value || '',
      emailID: this.propertyform.get('emailID')?.value || '',
      address: this.propertyform.get('address')?.value || '',
      landMark: this.propertyform.get('landMark')?.value || '',
      country: this.propertyform.get('country')?.value || '',
      state: this.propertyform.get('state')?.value || '',
      City: this.propertyform.get('City')?.value || '',
      NearBy: this.propertyform.get('NearBy')?.value || '',
      ZIPCode: this.propertyform.get('ZIPCode')?.value || '',
      ReraCertificateNumber: this.propertyform.get('ReraCertificateNumber')?.value || '',
      PropertyApprovedBy: this.propertyform.get('PropertyApprovedBy')?.value || '',
      PropertyType: this.propertyform.get('PropertyType')?.value || '',
      PropertyFor: this.propertyform.get('PropertyFor')?.value || '',
      PropertyStatus: this.propertyform.get('PropertyStatus')?.value || '',
      PropertyFacing: this.propertyform.get('PropertyFacing')?.value || '',
      TotalBlocks: this.propertyform.get('TotalBlocks')?.value || '',
      TotalFloors: this.propertyform.get('TotalFloors')?.value || '',
      NoOfFlats: this.propertyform.get('NoOfFlats')?.value || '',
      BlockName: this.propertyform.get('BlockName')?.value || '',
      PropertyOnWhichFloor: this.propertyform.get('PropertyOnWhichFloor')?.value || '',
      NoOfBedrooms: this.propertyform.get('NoOfBedrooms')?.value || '',
      NoOfBathrooms: this.propertyform.get('NoOfBathrooms')?.value || '',
      NoOfBalconies: this.propertyform.get('NoOfBalconies')?.value || '',
      NoOfParkings: this.propertyform.get('NoOfParkings')?.value || '',
      AreaType: this.propertyform.get('AreaType')?.value || '',
      TotalArea: this.propertyform.get('TotalArea')?.value || '',
      CarpetArea: this.propertyform.get('CarpetArea')?.value || '',
      PriceFor: this.propertyform.get('PriceFor')?.value || '',
      PropertyTotalPrice: this.propertyform.get('PropertyTotalPrice')?.value || '',
      AmenitiesCharges: this.propertyform.get('AmenitiesCharges')?.value || '',
      MaintenanceCharges: this.propertyform.get('MaintenanceCharges')?.value || '',
      CorpusFund: this.propertyform.get('CorpusFund')?.value || '',
      BuildYear: this.propertyform.get('BuildYear')?.value || '',
      PossessionDate: this.propertyform.get('PossessionDate')?.value ? new Date(this.propertyform.get('PossessionDate')?.value).toISOString() : null,
      ListDate: this.propertyform.get('ListDate')?.value ? new Date(this.propertyform.get('ListDate')?.value).toISOString() : null,
      websiteurl: this.propertyform.get('websiteurl')?.value || null,
      Pinteresturl: this.propertyform.get('Pinteresturl')?.value || null,
      Facebookurl: this.propertyform.get('Facebookurl')?.value || null,
      Twitterurl: this.propertyform.get('Twitterurl')?.value || null,
      GoogleLocationurl: this.propertyform.get('GoogleLocationurl')?.value || null,
      availabilityOptions: this.propertyform.get('availabilityOptions')?.value || '',
      userID: new String(localStorage.getItem('email')).toString(),
      ActiveStatus: "0"
    };
  
    if (!this.propID || this.propID.trim() === '') {
      console.error("Invalid propID");
      return;
    }
    console.log(data);
  
    this.apihttp.put(`https://localhost:7190/api/Users/updatePropertyDet/${this.propID}`, data, {
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
    this.apihttp.get(`https://localhost:7190/api/Users/GetAllPropertyDetailsWithUserID?userID=${this.userID}`)  // Adjust the API endpoint accordingly
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
    this.apihttp.get(`https://localhost:7190/api/Users/GetAllUsersPropertyDetails?userID=${this.userID}`)  // Adjust the API endpoint accordingly
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
  pageSize = 4; // Fixed page size (5 items per page)
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
}
