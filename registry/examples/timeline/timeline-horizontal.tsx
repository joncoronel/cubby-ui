import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/registry/default/timeline/timeline"

export default function TimelineHorizontal() {
  return (
    <Timeline orientation="horizontal">
      <TimelineItem step={1}>
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineHeader>
          <TimelineDate>Q1 2024</TimelineDate>
          <TimelineTitle>Planning</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          Research and planning
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem step={2}>
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineHeader>
          <TimelineDate>Q2 2024</TimelineDate>
          <TimelineTitle>Development</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          Build core features
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem step={3}>
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineHeader>
          <TimelineDate>Q3 2024</TimelineDate>
          <TimelineTitle>Testing</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          Quality assurance
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem step={4}>
        <TimelineIndicator />
        <TimelineHeader>
          <TimelineDate>Q4 2024</TimelineDate>
          <TimelineTitle>Launch</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          Production release
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  )
}