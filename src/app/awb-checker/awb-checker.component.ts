import { Component, OnInit } from '@angular/core';
import { AWBResult, AWBStatus } from '../_models/awb';
import { AWBCheckerService } from '../_services/awbchecker-service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-awb-checker',
  templateUrl: './awb-checker.component.html',
  styleUrls: ['./awb-checker.component.scss']
})


export class AwbCheckerComponent implements OnInit {

  statuses: AWBStatus[];
  results: AWBResult[];

  constructor(private awbCheckerServices: AWBCheckerService) { }

  ngOnInit(): void {
    this.awbCheckerServices.getStatuses().pipe(first()).subscribe(statuses => {
      console.info(statuses);
      this.statuses = statuses;
    },
    error => {
      console.error(error);
    });

    this.awbCheckerServices.getResults().pipe(first()).subscribe(results => {
      console.info(results);
      this.results = results;
    }, 
    error => {
      console.error(error);
    })
  }

  statusChanged(event: any) {
    console.info(this.results);
  }

  addResult() {
    this.results.push(new AWBResult("ARR", new Date()))
  }
  
  saveResults() {
    this.awbCheckerServices.saveResults(this.results).subscribe(some => {
      console.info(some);
      console.info('results saved');
    }, 
      err => {
        console.error(err);
      });
  }

  delete(documentId: number) {
    this.results.forEach((item, index) => {
      if(item.documentId === documentId) 
        this.results.splice(index, 1);
    });
  }
}
