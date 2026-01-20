import { Component, OnInit, HostListener } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';
import { RoomCard } from '../room-card/room-card';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home-component',
  imports: [SearchBar, RoomCard, NgFor],
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.scss'],
})
export class HomeComponent implements OnInit {
  rooms: { name: string }[] = [];
  pagedRooms: { name: string }[] = [];

  currentPage: number = 1;
  rowsPerPage: number = 2;
  cardsPerRow: number = 3;
  pageSize: number = this.rowsPerPage * this.cardsPerRow;

  isMobile: boolean = window.innerWidth < 576; // XS

  ngOnInit() {
    for (let i = 101; i <= 139; i++) {
      this.rooms.push({ name: `${i}` });
    }

    this.updatePageSettings();
    this.updatePagedRooms();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 576;
    this.updatePageSettings();
    this.updatePagedRooms();
  }

  updatePageSettings() {
    if (this.isMobile) {
      this.rowsPerPage = 1;
      this.cardsPerRow = 1;
    } else {
      this.rowsPerPage = 2;
      this.cardsPerRow = 3;
    }
    this.pageSize = this.rowsPerPage * this.cardsPerRow;
  }

  updatePagedRooms() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRooms = this.rooms.slice(start, end);
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    let start = Math.max(this.currentPage - 2, 1);
    let end = Math.min(start + 3, total);

    if (end - start < 3) {
      start = Math.max(end - 3, 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      this.updatePagedRooms();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedRooms();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.updatePagedRooms();
    }
  }

  totalPages(): number {
    return Math.ceil(this.rooms.length / this.pageSize);
  }
}
