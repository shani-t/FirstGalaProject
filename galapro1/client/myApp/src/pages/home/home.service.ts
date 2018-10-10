import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { redirectData } from "./redirectData.model";
import { Subject } from "../../../node_modules/rxjs/Subject";

@Injectable()
export class HomeService {
  private invalidUrl = new Subject<{errMessage:string , isInvalid:boolean}>();

  constructor(private http: HttpClient) {}

  sendData(data: string, isChecked: boolean) {
    var regexPattern = RegExp(
      '^(http://www.|https://www.|http://|https://)?[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}(:[0-9]{1,5})?(/.*)?$','g');
     //var regexValidation = regexPattern.test(data.toString());
    const redirect: redirectData = { data: data, isChecked: isChecked ,regexValidation:regexPattern.test(data.toString()) };
    this.http
      .post<{ data: string }>("http://localhost:3000/api/update", redirect)
      .subscribe(
        responseData => {
          console.log(responseData.data);
          this.invalidUrl.next({
            errMessage:"",
            isInvalid: false
          });
          responseData.data =responseData.data.replace(window.location.href, "")
            window.open(responseData.data);
        },
        err => {
          console.log(err.error);
          this.invalidUrl.next({
            errMessage:err.error,
            isInvalid: true
          });
        }
      );
  }

  addingDefault(data: string)  {
    const redirect: redirectData = { data: data, isChecked: true,regexValidation:true };
    this.http
      .post<{ message: string }>(
        "http://localhost:3000/api/addDefault",
        redirect
      )
      .subscribe(responseData => {
        console.log(responseData.message);
        return responseData;
      });
  }

  geValidationListener() {
    return this.invalidUrl.asObservable();
  }



}
