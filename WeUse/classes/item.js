export class item {
  index;
  id;
  name;
  quantity;
  grades;
  subject;
  contributor;
  imgUrl;
  stamps;
  level;
  needsApproval;
  description;
  constructor(index, id, name, quantity, grades, subject, contributor, imgUrl, stamps, level, needsApproval, description) {
    this.index = index;
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.grades = grades;
    this.subject = subject;
    this.contributor = contributor;
    this.imgUrl = imgUrl;
    this.stamps = stamps;
    this.level = level;
    this.needsApproval = needsApproval;
    this.description = description;
  }
}