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

export default function TimelineBasic() {
  return (
    <Timeline defaultValue={2}>
      <TimelineItem step={1}>
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineHeader>
          <TimelineDate>Jan 2024</TimelineDate>
          <TimelineTitle>Project started</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          Initial project setup and planning phase completed.
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem step={2}>
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineHeader>
          <TimelineDate>Feb 2024</TimelineDate>
          <TimelineTitle>Design phase</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          UI/UX design mockups and wireframes created.
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem step={3}>
        <TimelineIndicator />
        <TimelineSeparator />
        <TimelineHeader>
          <TimelineDate>Mar 2024</TimelineDate>
          <TimelineTitle>Development</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          Core application development and feature implementation.
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem step={4}>
        <TimelineIndicator />
        <TimelineHeader>
          <TimelineDate>Apr 2024</TimelineDate>
          <TimelineTitle>Testing & Launch</TimelineTitle>
        </TimelineHeader>
        <TimelineContent>
          Quality assurance testing and production deployment.
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  )
}