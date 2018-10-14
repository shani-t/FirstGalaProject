import { Component } from "@angular/core";
import { NavController, ToastController } from "ionic-angular";
import {
  FormGroup,
  FormBuilder,
  Validators
} from "../../../node_modules/@angular/forms";
import { HomeService } from "./home.service";
import { Observable } from "rxjs/Observable";
import { Socket } from "ng-socket-io";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  form: FormGroup;
  errMessage: string;
  isInvalid: boolean = false;
  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private homeService: HomeService,
    private socket: Socket,
    private toastCtrl: ToastController
  ) {
    this.form = this.formBuilder.group({
      data: [""],
      isChecked: [false, ""]
    });

    this.getDataFromSocket().subscribe(data => {
      let redirectRes = data["redirectRes"];
      if (data["event"] === "default") {
        this.showToast("Default URL: " + redirectRes);
      } else if(data["event"] === "new") {
        this.showToast("New URL: " + redirectRes);
      }
    });
  }

  submitData() {
    console.log("click on Submit");
    let startTime = new Date();
    this.homeService.sendData(this.form.value.data, this.form.value.isChecked);
    this.homeService.geValidationListener().subscribe(validation => {
      this.errMessage = validation.errMessage;
      this.isInvalid = validation.isInvalid;
      if(!this.isInvalid){
        let endTime =  new Date();
        console.log("Duartion Time :" +Math.abs(startTime.getTime() -endTime.getTime()));
      }

      if (this.errMessage == "the checkbox isn't marked") {
        this.socket.connect();
        this.socket.emit("set-current-url", this.form.value.data);
      }
      else {
        this.socket.emit("set-current-url", "stop");
        this.socket.disconnect();
      }
    });
  }
  updateData() {
    console.log("click on checkBox");
  }
  addingDefaultURL() {
    this.homeService.addingDefault("www.google.com");
  }

  getDataFromSocket() {
    let observable = new Observable(observer => {
      this.socket.on("url-changed", data => {
        observer.next(data);
      });
    });
    return observable;
  }

  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}
