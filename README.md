Database:

Admin:
    id: uid
    name:String
    email : string
    createdAt: datetime

Employee :
    id:uid
    empId:string
    Full Name : String
    Email Address : String
    Phone Number: String
    DepartmentID: Department
    Designation:Designation
    DATE of Joingin : Date
    Salary: Float
    Emp Status : Bool (T/F = Active or Inactive)
    createdBy: uid adming
    createdat:datetime
    updatedAT:dattibe
    updatedBY:uid adminn

Department:
    id:uid
    Name:String
    createdBy:UID
    createdAT:DateTime



APIS:
/api/emp/add POST
/api/emp/{id} GET
/api/emp GET GET ALL
/api/emp/{id} PATCH
/api/emp/{id} DELETE
/api/admin/login
/api/admin/create
/api/emp/export
/api/emp/search/{keyword}
/api/filter/ Pagination